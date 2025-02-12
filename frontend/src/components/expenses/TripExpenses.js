import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "../../styles/Expenses.module.css"; // Ensure you have styles for better UI
import Navbar from "../navbar/Navbar";
import ProfileDialog from "../profile/Profile";
const TripExpenses = () => {
  const { tripId } = useParams(); // Get trip ID from URL

  // States
  const [tripDetails, setTripDetails] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [sharedType, setSharedType] = useState(""); // Default is empty (no selection)
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [tripMates, setTripMates] = useState([]); // Store names of tripmates
  const [editingExpense, setEditingExpense] = useState(null);
  const [equallySplitDialogOpen, setEquallySplitDialogOpen] = useState(false);
  const [unequallySplitDialogOpen, setUnequallySplitDialogOpen] =
    useState(false);
  const [selectedTripMates, setSelectedTripMates] = useState([]);
  const [payerShares, setPayerShares] = useState({});

  const [unequalShares, setUnequalShares] = useState({});
  const [remainingAmount, setRemainingAmount] = useState(0);

  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  function handleShowProfile() {
    return setShowProfile(true);
  }

  // Fetch trip details and expenses on load
  useEffect(() => {
    const fetchTripDetails = async () => {
      const response = await fetch(
        `http://localhost:5000/trips/get-overview/${tripId}`,
        {
          method: "GET",
          credentials: "include", // Use cookies for authentication
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTripDetails(data);
        setBudget(data.budget);

        // Fetch tripmates' names
        const tripmatesResponse = await fetch(
          `http://localhost:5000/trips/get-tripmates/${tripId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!tripmatesResponse.ok) throw new Error("Failed to fetch tripmates");
        const tripmatesData = await tripmatesResponse.json();

        // Fetch names for tripmates using emails
        const responseNames = await fetch(
          "http://localhost:5000/api/get-users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              // emails: [data.createdBy, ...data.tripMates],
              emails: tripmatesData.tripMates,
            }), // Pass emails of tripmates
          }
        );

        const userData = await responseNames.json();
        setTripMates(userData); // Set names along with emails
      }
    };

    const fetchExpenses = async () => {
      const response = await fetch(
        `http://localhost:5000/expenses/get-expenses/${tripId}`,
        {
          method: "GET",
          credentials: "include", // Use cookies for authentication
        }
      );

      if (response.ok) {
        let data = await response.json();
        data = data.sort((a, b) => new Date(a.date) - new Date(b.date)); // ✅ Sort expenses by date
        setExpenses(data);
      }
    };

    fetchTripDetails();
    fetchExpenses();
  }, [tripId]);

  // Calculate total spent and remaining budget
  const totalSpent = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );
  const remaining = budget - totalSpent;
  const isLessThan10Percent = remaining < budget * 0.1;

  // Open modal for adding/editing expense
  const openModal = async (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setDate(
        expense.date ? new Date(expense.date).toISOString().split("T")[0] : ""
      );
      setAmount(expense.amount);
      setCategory(expense.category);
      setDescription(expense.description);
      setPaidBy(
        tripMates.find((mate) => mate.email === expense.payer)?.name ||
          expense.payer
      );
      setSharedType(expense.sharedType);
      setSelectedTripMates(expense.sharedAmong || []);

      // Initialize unequal shares if the expense is unequally split
      if (expense.sharedType === "unequally") {
        try {
          // Fetch the ExpenseShare documents for this expense
          const response = await fetch(
            `http://localhost:5000/expenses/get-expense-shares/${expense._id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (response.ok) {
            const expenseShares = await response.json();

            // Map the shares to the corresponding trip mates
            const initialShares = {};
            expense.sharedAmong.forEach((email) => {
              const shareDoc = expenseShares.find(
                (share) => share.payee === email
              );
              initialShares[email] = shareDoc ? shareDoc.share : 0;
            });

            setUnequalShares(initialShares); // Set the unequal shares state
            setRemainingAmount(
              expense.amount -
                expenseShares.reduce((sum, share) => sum + share.share, 0)
            );
          } else {
            console.error("Failed to fetch expense shares");
          }
        } catch (error) {
          console.error("Error fetching expense shares:", error);
        }
      } else {
        setUnequalShares({});
        setRemainingAmount(0);
      }
    } else {
      setEditingExpense(null);
      setDate("");
      setAmount("");
      setCategory("");
      setDescription("");
      setPaidBy("");
      setSharedType(""); // Reset to default
      setSelectedTripMates(tripMates.map((mate) => mate.email));
      setPayerShares({});
      setUnequalShares({});
      setRemainingAmount(0);
    }
    setIsModalOpen(true);
  };
  // Close modal
  const closeModal = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const handleSharedTypeChange = (e) => {
    const value = e.target.value;
    setSharedType(value);

    if (value === "unequally") {
      const initialShares = {};
      tripMates.forEach((mate) => {
        initialShares[mate.email] = 0;
      });
      setUnequalShares(initialShares);
      setRemainingAmount(parseFloat(amount) || 0);
    }
  };

  const handleUnequalShareChange = (email, value) => {
    const newShares = { ...unequalShares };
    newShares[email] = parseFloat(value) || 0;

    console.log("newShares", newShares);

    // Calculate total assigned amount, excluding users with a share of 0
    const totalAssigned = Object.values(newShares)
      .filter((val) => val > 0) // Exclude 0 shares
      .reduce((sum, val) => sum + val, 0);

    // Prevent exceeding total expense
    if (totalAssigned > parseFloat(amount)) {
      alert("Total shared amount cannot exceed expense amount!");
      return;
    }

    // Remove users with a share of 0 from the unequalShares state
    const filteredShares = Object.fromEntries(
      Object.entries(newShares).filter(([email, share]) => share > 0)
    );

    setUnequalShares(filteredShares);
    setRemainingAmount(parseFloat(amount) - totalAssigned);
  };

  // Handle equally split dialog close
  const handleEquallySplitDialogClose = () => {
    setEquallySplitDialogOpen(false);
  };

  // Handle unequally split dialog close
  const handleUnequallySplitDialogClose = () => {
    setUnequallySplitDialogOpen(false);
  };

  // Handle trip mate selection for equally split
  const handleTripMateSelection = (email) => {
    setSelectedTripMates((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((e) => e !== email)
        : [...prevSelected, email]
    );
  };

  // Calculate owing amount for equally split
  const calculateOwingAmount = () => {
    const totalAmount = parseFloat(amount);
    if (!amount || isNaN(totalAmount) || totalAmount <= 0) {
      return 0;
    }
    const numberOfTripMates = selectedTripMates.length;
    return numberOfTripMates > 0 ? totalAmount / numberOfTripMates : 0;
  };

  // Add or update expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();

    // Validate that sharedType is selected
    if (!sharedType) {
      alert("Please select a split type.");
      return;
    }

    // Validate unequal shares if sharedType is "unequally"
    if (sharedType === "unequally" && remainingAmount > 0) {
      alert("Please assign the remaining amount to trip mates.");
      return;
    }

    // Prepare expense data to be sent to the server
    const expenseData = {
      tripId,
      date,
      amount,
      category,
      description,
      payer: tripMates.find((mate) => mate.name === paidBy)?.email || paidBy,
      sharedType,
      sharedAmong:
        sharedType === "equally"
          ? selectedTripMates
          : Object.keys(unequalShares), // Shared members
    };

    // Add customShares only if the split type is "unequally"
    if (sharedType === "unequally") {
      // Convert the unequalShares object to an array of shares in the same order as sharedAmong
      expenseData.customShares = Object.keys(unequalShares).map(
        (email) => unequalShares[email]
      );
    }

    // Define the API URL and method based on whether we are editing or adding a new expense
    const url = editingExpense
      ? `http://localhost:5000/expenses/update-expense/${editingExpense._id}`
      : "http://localhost:5000/expenses/add-expense";

    const method = editingExpense ? "PUT" : "POST";

    // Send the request to the server
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
      credentials: "include", // Include cookies if necessary
    });

    // Handle the response
    if (response.ok) {
      const result = await response.json();

      // Update the expenses state after adding or editing the expense
      let updatedExpenses;
      if (editingExpense) {
        updatedExpenses = expenses.map((exp) =>
          exp._id === result.expense._id ? result.expense : exp
        );
      } else {
        updatedExpenses = [...expenses, result.expense];
      }

      // Sort expenses by date
      updatedExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));

      setExpenses(updatedExpenses); // Update the expenses list in the state
      closeModal(); // Close the modal after saving
    } else {
      console.error("Error saving expense");
    }
  };

  // Function to calculate payer shares for equally split
  const calculatePayerShares = () => {
    if (sharedType !== "equally") return {}; // Prevent overriding for unequally split

    const owingAmount = calculateOwingAmount();
    const newPayerShares = {};
    selectedTripMates.forEach((email) => {
      newPayerShares[email] = owingAmount;
    });
    return newPayerShares;
  };

  // Delete an expense
  const handleDeleteExpense = async (expenseId) => {
    const response = await fetch(
      `http://localhost:5000/expenses/delete-expense/${expenseId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (response.ok) {
      setExpenses((prevExpenses) => {
        const updated = prevExpenses.filter(
          (expense) => expense._id !== expenseId
        );
        return updated.sort((a, b) => new Date(a.date) - new Date(b.date)); // ✅ Sort after deleting
      });
    }
  };

  return (
    <>
      <Navbar
        toggleMenu={toggleMenu}
        menuOpen={menuOpen}
        setShowProfile={() => setShowProfile(true)} // Open the profile dialog
      />
      {showProfile && (
        <ProfileDialog
          show={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
      <div className={styles.tripExpenseContainer}>
        <div className="bodyDiv">
          <div className={styles.expensesContainer}>
            <div className={styles.tripDetailsCard}>
              <h2>Trip to {tripDetails?.destination}</h2>
              <p>
                <strong>Estimated Budget: </strong> ₹ {budget}
              </p>
              <div className={styles.spentRemaining}>
                <p>
                  <strong>Spent: </strong> ₹ {totalSpent}
                </p>
                <p
                  style={{
                    color: isLessThan10Percent ? "red" : " ",
                  }}
                >
                  <strong>Remaining: </strong> ₹ {remaining}
                </p>
              </div>
              <button
                className={styles.addExpenseBtn}
                onClick={() => openModal()}
              >
                Add Expense
              </button>
            </div>
          </div>

          {/* Expense List */}
          <div className={styles.expenseList}>
            {expenses.map((expense) => (
              <div className={styles.expenseCard} key={expense._id}>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(expense.date).toLocaleDateString()}
                </p>
                <p>
                  {" "}
                  <span>{expense.category}</span>
                  <span>Rs.{expense.amount}</span>
                </p>

                <p>{expense.description}</p>
                <p>
                  <strong>Paid by: </strong>
                  {tripMates.find((mate) => mate.email === expense.payer)
                    ?.name || expense.payer}
                </p>
                <p>
                  <strong>Shared By: </strong>
                  {expense.sharedType === "equally"
                    ? `${expense.sharedAmong.length} members equally`
                    : expense.sharedType === "unequally"
                    ? `${expense.sharedAmong.length} members unequally`
                    : "Not shared"}
                </p>

                <button
                  className={styles.expenseEdit}
                  onClick={() => openModal(expense)}
                >
                  <img src={"/images/edit.png"} alt="edit icon" />
                </button>
                <button
                  className={styles.expenseDelete}
                  onClick={() => handleDeleteExpense(expense._id)}
                >
                  <img src={"/images/dustbin.png"} alt="delete icon" />
                </button>
              </div>
            ))}
          </div>

          {/* Modal for Adding/Editing Expense */}
          {isModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.expenseModal}>
                <h3>{editingExpense ? "Edit Expense" : "Add Expense"}</h3>
                <form onSubmit={handleSaveExpense}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    min="0"
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Lodging">Lodging</option>
                    <option value="Entry Fee">Entry Fee</option>
                    <option value="Health">Health</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Tips & Donations">Tips & Donations</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    maxlength="25"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  {/* Paid By */}
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select Payer
                    </option>
                    {tripMates.map((mate) => (
                      <option key={mate.email} value={mate.email}>
                        {mate.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sharedType}
                    onChange={handleSharedTypeChange}
                    required
                  >
                    <option value="">Select Split Type</option>
                    <option value="equally">Equally</option>
                    <option value="unequally">Unequally</option>
                  </select>
                  {sharedType === "equally" && (
                    <button
                      className={styles.adjustSplitbtn}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default button action
                        setEquallySplitDialogOpen(true);
                      }}
                    >
                      Adjust Split
                    </button>
                  )}

                  {sharedType === "unequally" && (
                    <button
                      className={styles.adjustSplitbtn}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default button action
                        setUnequallySplitDialogOpen(true);
                      }}
                    >
                      Adjust Split
                    </button>
                  )}

                  <button type="submit" className={styles.submitbtn}>
                    {editingExpense ? "Update" : "Add"} Expense
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.cancelbtn}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Pop-up Dialog for Equally Split */}
          {equallySplitDialogOpen && (
            <div
              className={styles.popupOverlay}
              onClick={handleEquallySplitDialogClose}
            >
              <div
                className={styles.equallySplitDialog}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Split Equally Among</h3>
                <p className={styles.splitMsg}>
                  <strong>Each person owes:</strong> Rs.
                  {calculateOwingAmount().toFixed(2)}
                </p>
                <div className={styles.equalContainer}>
                  {tripMates.map((mate) => (
                    <div key={mate.email}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedTripMates.includes(mate.email)}
                          onChange={() => handleTripMateSelection(mate.email)}
                        />
                        {mate.name}
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  className={styles.submitbtn}
                  onClick={handleEquallySplitDialogClose}
                >
                  Done
                </button>
                <button
                  className={styles.cancelbtn}
                  onClick={() => setEquallySplitDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Pop-up Dialog for Unequally Split */}
          {unequallySplitDialogOpen && (
            <div
              className={styles.popupOverlay}
              onClick={handleUnequallySplitDialogClose}
            >
              <div
                className={styles.unequallySplitDialog}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Split Unequally Among</h3>
                <div>
                  <p>
                    <strong className={styles.splitMsg}>
                      Remaining to be shared: ₹
                    </strong>
                    {remainingAmount.toFixed(2)}
                  </p>
                  <div className={styles.equalContainer}>
                    {tripMates.map((mate) => (
                      <div key={mate.email} className={styles.unequalSplit}>
                        <label className={styles.unequalLabel}>
                          {mate.name}:
                        </label>
                        <input
                          className={styles.unequalInput}
                          type="number"
                          value={unequalShares[mate.email] || ""}
                          onChange={(e) =>
                            handleUnequalShareChange(mate.email, e.target.value)
                          }
                          min="0"
                          max={amount} // Prevent exceeding total amount
                        />
                      </div>
                    ))}
                  </div>

                  <p></p>
                  <button
                    className={styles.submitbtn}
                    onClick={handleUnequallySplitDialogClose}
                  >
                    Done
                  </button>
                  <button
                    className={styles.cancelbtn}
                    onClick={() => setUnequallySplitDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TripExpenses;
