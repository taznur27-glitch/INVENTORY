import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useBulkImportInventory } from '@/hooks/useData';

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  result.push(current.trim());
  return result.map((v) => v.replace(/^"|"$/g, '').trim());
}

function parseInventoryCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) throw new Error('CSV is empty. Add header + at least 1 data row.');

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const col = (name: string) => headers.indexOf(name);

  const requiredColumns = ['imei', 'brand', 'model', 'storage', 'condition', 'purchase_source', 'purchase_price', 'purchase_date', 'warranty_status'];
  const missing = requiredColumns.filter((name) => col(name) === -1);
  if (missing.length) throw new Error(`Missing required CSV columns: ${missing.join(', ')}`);

  return lines.slice(1).map((line, i) => {
    const row = splitCsvLine(line);
    const imei = row[col('imei')] || '';
    const purchasePrice = Number(row[col('purchase_price')] || 0);

    if (!/^\d{15}$/.test(imei)) throw new Error(`Row ${i + 2}: IMEI must be 15 digits`);
    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) throw new Error(`Row ${i + 2}: purchase_price must be > 0`);

    return {
      imei,
      brand: row[col('brand')] || 'Unknown',
      model: row[col('model')] || 'Unknown',
      ram: row[col('ram')] || '—',
      storage: row[col('storage')] || '—',
      color: row[col('color')] || '—',
      condition: row[col('condition')] || 'Used',
      purchase_source: row[col('purchase_source')] || 'Dealer',
      supplier_id: row[col('supplier_id')] || null,
      purchase_price: purchasePrice,
      purchase_date: row[col('purchase_date')],
      warranty_status: row[col('warranty_status')] || 'No Warranty',
      warranty_expiry: row[col('warranty_expiry')] || null,
      status: row[col('status')] || 'In Stock',
      notes: row[col('notes')] || null,
      photo_url: null,
    };
  });
}

export default function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const bulkImport = useBulkImportInventory();

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const rows = parseInventoryCsv(text);
      const res = await bulkImport.mutateAsync(rows);
      toast.success(`Bulk import complete: ${res.inserted} inserted, ${res.skipped} skipped.`);
      setOpen(false);
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Bulk import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-1.5">
          <Upload className="w-4 h-4" /> Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Import Inventory (CSV)</DialogTitle>
          <DialogDescription>
            Required headers: imei, brand, model, storage, condition, purchase_source, purchase_price, purchase_date, warranty_status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button asChild type="button" variant="secondary" className="w-full">
            <a href="/sample_inventory_import.csv" download>
              Download Sample Spreadsheet (CSV)
            </a>
          </Button>
          <Input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <p className="text-xs text-muted-foreground">
            Optional columns: ram, color, supplier_id, warranty_expiry, status, notes.
          </p>
          <Button onClick={handleImport} className="w-full" disabled={loading || !file}>
            {loading ? 'Importing...' : 'Import CSV'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}