import { Money } from '@jadetree/currency';
import api from '../api';

/** Category Schema */
export type CategorySchema = {
  id?: number;
  name?: string;
  system?: boolean;
  hidden?: boolean;
  currency?: string;
  notes?: string | null;
  display_order?: number | null;
  default_budget?: string | Money | null;
  parent_id?: number | null;
  children?: CategorySchema[];
}

/** Category Data Schema */
export type CategoryDataSchema = {
  category_id: number;
  parent_id: number | null;
  entry_id: number | null;
  budget?: string | Money;
  outflow?: string | Money;
  balance?: string | Money;
  carryover?: string | Money;
  overspend?: string | Money;
  rollover?: boolean;
  notes?: string;
  num_transactions?: number;
  [key: string]: string | number | Money | boolean | null | undefined;
}

/** Budget Entry Schema */
export type EntrySchema = {
  id?: number;
  month?: string;
  category_id?: number;
  amount?: string | Money;
  currency?: string;
  rollover?: boolean;
  default?: boolean;
  notes?: string;
}

/** Budget Schema */
export type BudgetSchema = {
  id?: number;
  name?: string;
  notes?: string;
  currency?: string;
  categories?: CategorySchema[];
}

/** Budget Data Schema */
export type BudgetDataSchema = {
  categories: CategoryDataSchema[];
  entries: EntrySchema[];
  last_available?: string | Money;
  last_overspent?: string | Money;
  overspent?: string | Money;
  income?: string | Money;
  budgeted?: string | Money;
  available?: string | Money;
  currency: string;
  [key: string]: string | Money | CategoryDataSchema[] | EntrySchema[] | undefined;
}

/** Budget Update Schema */
export type BudgetUpdateSchema = {
  name?: string;
  notes?: string;
}

/** Load the Category Schema Money Objects */
function loadCategorySchema(data: CategorySchema): CategorySchema {
  const loaded = { ...data };
  if (typeof data.default_budget === 'string') {
    // eslint-disable-next-line @typescript-eslint/camelcase
    loaded.default_budget = new Money(data.default_budget, data.currency);
  }

  if (data.children && data.children.length) {
    loaded.children = data.children.map((c) => loadCategorySchema(c));
  }

  return loaded;
}

/** Dump the Category Schema Money Objects */
function dumpCategorySchema(data: CategorySchema): CategorySchema {
  const dumped = { ...data };
  if (data.default_budget instanceof Money) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    dumped.default_budget = data.default_budget.amount.toFixed(4).toString();
  }

  return dumped;
}

/** Load the Category Data Schema Money Objects */
function loadCategoryDataSchema(
  data: CategoryDataSchema,
  currency: string,
): CategoryDataSchema {
  const fields = [
    'budget',
    'outflow',
    'balance',
    'carryover',
    'overspend',
  ];

  const loaded = { ...data };
  fields.forEach((field) => {
    if (typeof data[field] === 'string') {
      loaded[field] = new Money(data[field] as string, currency);
    }
  });

  return loaded;
}

/** Dump the Budget Entry Schema Money Objects */
function dumpEntrySchema(data: EntrySchema): EntrySchema {
  const dumped = { ...data };
  if (data.amount instanceof Money) {
    dumped.amount = data.amount.amount.toFixed(4).toString();
  }

  return dumped;
}

/** Load the Budget Entry Schema Money Objects */
function loadEntrySchema(data: EntrySchema): EntrySchema {
  const loaded = { ...data };
  if (typeof data.amount === 'string') {
    loaded.amount = new Money(data.amount, data.currency);
  }

  return loaded;
}

/** Dump the Budget Schema Money Objects */
function dumpBudgetSchema(data: BudgetSchema): BudgetSchema {
  const dumped = { ...data };

  // Dump Category Data
  if (data.categories) {
    dumped.categories = data.categories.map((c) => dumpCategorySchema(c));
  }

  return dumped;
}

/** Load the Budget Schema Money Objects */
function loadBudgetSchema(data: BudgetSchema): BudgetSchema {
  const loaded = { ...data };

  // Load Category Data
  loaded.categories = (data.categories || []).map(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (c) => loadCategorySchema(c),
  );

  return loaded;
}

/** Load the Budget Data Schema Money Objects */
function loadBudgetDataSchema(data: BudgetDataSchema): BudgetDataSchema {
  const fields = [
    'last_available',
    'last_overspent',
    'overspent',
    'income',
    'budgeted',
    'available',
  ];

  const loaded = { ...data };
  fields.forEach((field) => {
    if (typeof data[field] === 'string') {
      loaded[field] = new Money(data[field] as string, data.currency);
    }
  });

  // Load Category Data
  loaded.categories = data.categories.map(
    (c) => loadCategoryDataSchema(c, data.currency),
  );

  // Load Entry Data
  loaded.entries = data.entries.map(
    (e) => loadEntrySchema(e),
  );

  return loaded;
}

/** Get a list of Budget Categories */
function getCategories(budgetId: number): Promise<CategorySchema[]> {
  return api.get<CategorySchema[]>(`/budgets/${budgetId}/categories`)
    .then((data) => data.map((category) => loadCategorySchema(category)));
}

/** Get a single Budget Category */
function getCategory(budgetId: number, categoryId: number): Promise<CategorySchema> {
  return api.get<CategorySchema>(`/budgets/${budgetId}/categories/${categoryId}`)
    .then((data) => loadCategorySchema(data));
}

/** Create a Category or Category Group */
function createCategory(budgetId: number, data: CategorySchema): Promise<CategorySchema> {
  return api.post<CategorySchema>(
    `/budgets/${budgetId}/categories`,
    dumpCategorySchema(data),
  ).then((response) => loadCategorySchema(response));
}

/** Delete a Category or Category Group */
function deleteCategory(
  budgetId: number,
  categoryId: number,
): Promise<void> {
  return api.delete<void>(`/budgets/${budgetId}/categories/${categoryId}`);
}

/** Update a Category or Category Group */
function updateCategory(
  budgetId: number,
  categoryId: number,
  data: CategorySchema,
): Promise<CategorySchema> {
  return api.put<CategorySchema>(
    `/budgets/${budgetId}/categories/${categoryId}`,
    dumpCategorySchema(data),
  ).then((response) => loadCategorySchema(response));
}

/** Get a list of Budgets */
function getBudgets(): Promise<BudgetSchema[]> {
  return api.get<BudgetSchema[]>('/budgets')
    .then((data) => data.map((budget) => loadBudgetSchema(budget)));
}

/** Get a Budget by Id */
function getBudget(id: number): Promise<BudgetSchema> {
  return api.get<BudgetSchema>(`/budgets/${id}`)
    .then((data) => loadBudgetSchema(data));
}

/** Create a new Budget */
function createBudget(data: BudgetSchema): Promise<BudgetSchema> {
  return api.post<BudgetSchema>('/budgets', dumpBudgetSchema(data))
    .then((budget) => loadBudgetSchema(budget));
}

/** Delete a Budget */
function deleteBudget(id: number): Promise<void> {
  return api.delete<void>(`/budgets/${id}`);
}

/** Update a Budget Name and Notes */
function updateBudget(id: number, data: BudgetUpdateSchema): Promise<BudgetSchema> {
  return api.put<BudgetSchema>(`/budgets/${id}`, dumpBudgetSchema(data))
    .then((budget) => loadBudgetSchema(budget));
}

/** Get Budget Monthly Data by Id */
function getBudgetData(
  id: number,
  month?: number,
  year?: number,
): Promise<BudgetDataSchema> {
  let query = '';
  if (month && year) {
    query = `?year=${year}&month=${month}`;
  }

  return api.get<BudgetDataSchema>(`/budgets/${id}/data${query}`)
    .then((data) => loadBudgetDataSchema(data));
}

/** Create a Budget Entry */
function createEntry(budgetId: number, entry: EntrySchema): Promise<EntrySchema> {
  const body = dumpEntrySchema(entry);
  return api.post<EntrySchema>(`/budgets/${budgetId}/entries`, body)
    .then((data) => loadEntrySchema(data));
}

/** Get a Budget Entry */
function getEntry(budgetId: number, entryId: number): Promise<EntrySchema> {
  return api.get<EntrySchema>(`/budgets/${budgetId}/entries/${entryId}`)
    .then((data) => loadEntrySchema(data));
}

/** Delete a Budget Entry */
function deleteEntry(budgetId: number, entryId: number): Promise<void> {
  return api.delete<void>(`/budgets/${budgetId}/entries/${entryId}`);
}

/** Update a Budget Entry */
function updateEntry(
  budgetId: number,
  entryId: number,
  entry: EntrySchema,
): Promise<EntrySchema> {
  const body = dumpEntrySchema(entry);
  return api.put<EntrySchema>(`/budgets/${budgetId}/entries/${entryId}`, body)
    .then((data) => loadEntrySchema(data));
}

/**
 * Translate Special Category Names
 */
function translateName(name: string): string {
  if (name === '_income') return 'Income';
  if (name === '_debt') return 'Pre-Jade Tree Debt';
  if (name === '_cur_month') return 'Current Month';
  if (name === '_next_month') return 'Next Month';
  return name;
}

export default {
  createBudget,
  createCategory,
  createEntry,
  deleteBudget,
  deleteCategory,
  deleteEntry,
  getBudget,
  getBudgets,
  getBudgetData,
  getCategory,
  getCategories,
  getEntry,
  translateName,
  updateBudget,
  updateCategory,
  updateEntry,
};
