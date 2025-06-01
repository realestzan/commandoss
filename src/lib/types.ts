export type User = {
    id: string;
    email: string;
    name: string;
    avatar: string;

    preferredCurrency: string;
    createdAt: string;
    monthlyIncome?: number;
    defaultBudgetId?: string;
    financialGoals?: FinancialGoal[];
}

export type FinancialGoal = {
    id: string;
    userId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    createdAt: string;
}

export type BankAccount = {
    id: string;
    userId: string;
    name: string;
    balance: number;
    institution?: string;
    accountType?: "checking" | "savings" | "credit";
    lastSynced?: string;
}

export type Transaction = {
    id: string;
    userId: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    description: string;
    date: string;
    category?: ExpenseCategory;
    relatedGoalId?: string;
    sourceAccountId?: string;
    destinationAccountId?: string;
    budgetId?: string;
}

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "INR" | "MXN" | "NZD" | "RUB" | "SAR" | "SGD" | "ZAR";

export type ExpenseCategory =
    | "food"
    | "transport"
    | "housing"
    | "utilities"
    | "entertainment"
    | "salary"
    | "savings"
    | "health"
    | "education"
    | "debt"
    | "other";

export type Budget = {
    id: string;
    userId: string;
    name: string;
    amount: number;
    startDate: string;
    endDate: string;
    transactionIds?: string[]; // Or filter transactions by budgetId
}

export type BillReminder = {
    id: string;
    userId: string;
    name: string;
    amount: number;
    dueDate: string;
    status: "paid" | "unpaid" | "overdue";
}

export type RecurringItem = {
    id: string;
    userId: string;
    name: string;
    type: "income" | "bill";
    amount: number;
    frequency: "weekly" | "biweekly" | "monthly";
    nextDueDate: string;
}

export type ChatInsight = {
    id: string;
    userId: string;
    type: "warning" | "suggestion" | "info";
    message: string;
    generatedAt: string;
    relatedTransactionId?: string;
}
