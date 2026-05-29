export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-3 block text-sm font-medium text-slate-600">
      {label}
      <input
        required={required}
        className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-3 text-ink outline-none focus:border-teal focus:bg-white"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="mb-3 block text-sm font-medium text-slate-600">
      {label}
      <select
        required
        className="mt-1 h-10 w-full rounded-lg border border-line bg-mist px-3 text-ink outline-none focus:border-teal focus:bg-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </label>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg bg-teal px-4 font-semibold text-white hover:bg-teal/90" type="submit">
      {label}
    </button>
  );
}
