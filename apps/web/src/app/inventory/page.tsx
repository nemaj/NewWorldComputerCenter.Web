'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { PackagePlus, Pencil, Plus, Send, X } from 'lucide-react';
import { AppShell, PageHeader } from '@/components/layout';
import { TablePagination, TableSearch, useSearchPagination } from '@/components/tables';
import { ADD_PRODUCT_STOCK, CREATE_PRODUCT, MOVE_OUT_PRODUCT_STOCK, Product, PRODUCTS_QUERY, StockMovement, UPDATE_PRODUCT } from '@/features/inventory';
import { shortDate } from '@/features/billing';
import styles from '../dashboard.module.scss';

type ProductsData = {
  products: Product[];
  stockMovements: StockMovement[];
};

type ProductForm = {
  sku: string;
  name: string;
  description: string;
  quantity: string;
};

export default function InventoryPage() {
  const { data, loading } = useQuery<ProductsData>(PRODUCTS_QUERY);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [addStock] = useMutation(ADD_PRODUCT_STOCK);
  const [moveOutStock] = useMutation(MOVE_OUT_PRODUCT_STOCK);
  const [form, setForm] = useState<ProductForm>({ sku: '', name: '', description: '', quantity: '0' });
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const products = data?.products ?? [];
  const stockMovements = data?.stockMovements ?? [];
  const productTable = useSearchPagination(products, (product, search) =>
    [product.sku, product.name, product.description, product.quantity]
      .filter((value) => value !== undefined)
      .some((value) => String(value).toLowerCase().includes(search))
  );
  const movementTable = useSearchPagination(stockMovements, (movement, search) =>
    [movement.product.sku, movement.product.name, movement.type, movement.quantity, movement.movedAt]
      .some((value) => String(value).toLowerCase().includes(search))
  );

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    setForm({
      sku: editingProduct.sku,
      name: editingProduct.name,
      description: editingProduct.description ?? '',
      quantity: String(editingProduct.quantity)
    });
  }, [editingProduct]);

  function openCreateModal() {
    setError('');
    setEditingProduct(null);
    setForm({ sku: '', name: '', description: '', quantity: '0' });
    setModalMode('create');
  }

  function openEditModal(product: Product) {
    setError('');
    setEditingProduct(product);
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingProduct(null);
    setError('');
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      if (modalMode === 'create') {
        await createProduct({
          variables: { input: { ...form, quantity: Number(form.quantity) } },
          refetchQueries: [{ query: PRODUCTS_QUERY }],
          awaitRefetchQueries: true
        });
      } else if (editingProduct) {
        await updateProduct({
          variables: {
            id: editingProduct.id,
            input: {
              sku: form.sku,
              name: form.name,
              description: form.description
            }
          },
          refetchQueries: [{ query: PRODUCTS_QUERY }],
          awaitRefetchQueries: true
        });
      }

      closeModal();
    } catch {
      setError('Unable to save product. Check that the SKU is unique and values are valid.');
    }
  }

  async function adjustStock(productId: string, direction: 'in' | 'out') {
    const quantity = Number(adjustments[productId] || 0);
    setError('');

    try {
      await (direction === 'in' ? addStock : moveOutStock)({
        variables: { productId, quantity },
        refetchQueries: [{ query: PRODUCTS_QUERY }],
        awaitRefetchQueries: true
      });
      setAdjustments((current) => ({ ...current, [productId]: '' }));
    } catch {
      setError(direction === 'in' ? 'Stock in quantity must be greater than zero.' : 'Move out quantity must be greater than zero and not exceed available stock.');
    }
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Product inventory" title="Inventory" />

      <div className="mt-6 flex justify-end">
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal px-4 font-semibold text-white hover:bg-teal/90" type="button" onClick={openCreateModal}>
          <PackagePlus size={17} />
          Add product
        </button>
      </div>
      {error && !modalMode ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-lg font-bold">Products</h3>
            <p className="text-sm text-slate-500">Track stock on hand, add stock, or move inventory out.</p>
          </div>
          <TableSearch value={productTable.search} onChange={productTable.setSearch} placeholder="Search products" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Quantity left</th>
                <th className="px-5 py-3">Stock action</th>
                <th className="px-5 py-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={6}>Loading products...</td></tr>
              ) : productTable.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={6}>No products found.</td></tr>
              ) : productTable.pagedRows.map((product) => (
                <tr key={product.id} className="border-t border-line">
                  <td className="px-5 py-4 font-medium">{product.sku}</td>
                  <td className="px-5 py-4">{product.name}</td>
                  <td className="px-5 py-4">{product.description || '-'}</td>
                  <td className="px-5 py-4 font-bold">{product.quantity}</td>
                  <td className="px-5 py-4">
                    <div className="flex min-w-[280px] flex-wrap items-center gap-2">
                      <input
                        className="h-10 w-24 rounded-lg border border-line bg-white px-3"
                        min="1"
                        type="number"
                        value={adjustments[product.id] ?? ''}
                        onChange={(event) => setAdjustments({ ...adjustments, [product.id]: event.target.value })}
                        placeholder="Qty"
                      />
                      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 font-semibold hover:border-teal hover:text-teal" onClick={() => adjustStock(product.id, 'in')} type="button">
                        <Plus size={16} />
                        Add
                      </button>
                      <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 font-semibold hover:border-teal hover:text-teal" onClick={() => adjustStock(product.id, 'out')} type="button">
                        <Send size={16} />
                        Move out
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-slate-600 hover:border-teal hover:text-teal" type="button" onClick={() => openEditModal(product)}>
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={productTable.page} totalPages={productTable.totalPages} totalRows={productTable.totalRows} onPageChange={productTable.setPage} />
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h3 className="text-lg font-bold">Stock movement history</h3>
            <p className="text-sm text-slate-500">Every stock in and move out action is recorded with a date.</p>
          </div>
          <TableSearch value={movementTable.search} onChange={movementTable.setSearch} placeholder="Search movements" />
        </div>
        <div className={`${styles.tableWrap} overflow-x-auto`}>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-5" colSpan={5}>Loading movements...</td></tr>
              ) : movementTable.totalRows === 0 ? (
                <tr><td className="px-5 py-5" colSpan={5}>No stock movements yet.</td></tr>
              ) : movementTable.pagedRows.map((movement) => (
                <tr key={movement.id} className="border-t border-line">
                  <td className="px-5 py-4">{shortDate(movement.movedAt)}</td>
                  <td className="px-5 py-4 font-medium">{movement.product.sku}</td>
                  <td className="px-5 py-4">{movement.product.name}</td>
                  <td className="px-5 py-4">{movement.type === 'IN' ? 'Stock in' : 'Move out'}</td>
                  <td className="px-5 py-4 font-bold">{movement.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={movementTable.page} totalPages={movementTable.totalPages} totalRows={movementTable.totalRows} onPageChange={movementTable.setPage} />
      </section>

      {modalMode ? (
        <ProductModal
          form={form}
          mode={modalMode}
          error={error}
          onClose={closeModal}
          onSubmit={submitProduct}
          onFormChange={setForm}
        />
      ) : null}
    </AppShell>
  );
}

function ProductModal({
  mode,
  form,
  error,
  onClose,
  onSubmit,
  onFormChange
}: {
  mode: 'create' | 'edit';
  form: ProductForm;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (form: ProductForm) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
      <section className="w-full max-w-lg rounded-lg bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-lg font-bold">{mode === 'create' ? 'Add product' : 'Update product'}</h3>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-line text-slate-600 hover:border-teal hover:text-teal" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <form className="p-5" onSubmit={onSubmit}>
          {error ? <p className="mb-3 text-sm font-medium text-red-600">{error}</p> : null}
          <label className="mb-3 block text-sm font-medium text-slate-600">
            SKU
            <input className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-3 outline-none focus:border-teal focus:bg-white" required value={form.sku} onChange={(event) => onFormChange({ ...form, sku: event.target.value })} />
          </label>
          <label className="mb-3 block text-sm font-medium text-slate-600">
            Product name
            <input className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-3 outline-none focus:border-teal focus:bg-white" required value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} />
          </label>
          <label className="mb-3 block text-sm font-medium text-slate-600">
            Description
            <input className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-3 outline-none focus:border-teal focus:bg-white" value={form.description} onChange={(event) => onFormChange({ ...form, description: event.target.value })} />
          </label>
          {mode === 'create' ? (
            <label className="mb-3 block text-sm font-medium text-slate-600">
              Starting quantity
              <input className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-3 outline-none focus:border-teal focus:bg-white" min="0" required type="number" value={form.quantity} onChange={(event) => onFormChange({ ...form, quantity: event.target.value })} />
            </label>
          ) : null}
          <button className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg bg-teal px-4 font-semibold text-white hover:bg-teal/90" type="submit">
            {mode === 'create' ? 'Save product' : 'Update product'}
          </button>
        </form>
      </section>
    </div>
  );
}
