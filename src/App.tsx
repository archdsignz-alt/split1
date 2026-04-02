import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Wifi, 
  Landmark, 
  Droplets, 
  Zap, 
  Plus, 
  Calculator, 
  RotateCcw,
  Download,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Bill {
  id: string;
  name: string;
  amount: number | '';
  icon: string;
  isFixed: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  Home,
  Wifi,
  Landmark,
  Droplets,
  Zap,
  Plus
};

const DEFAULT_BILLS: Bill[] = [
  { id: 'rent', name: 'Rent', amount: 1000, icon: 'Home', isFixed: true },
  { id: 'wifi', name: 'WiFi', amount: 50, icon: 'Wifi', isFixed: true },
  { id: 'council_tax', name: 'Council Tax', amount: 150, icon: 'Landmark', isFixed: true },
  { id: 'water', name: 'Water', amount: '', icon: 'Droplets', isFixed: false },
  { id: 'electric', name: 'Electric', amount: '', icon: 'Zap', isFixed: false },
];

export default function App() {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('flatmate-bills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bills from local storage', e);
      }
    }
    return DEFAULT_BILLS;
  });

  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text('Monthly Bills Summary', 14, 22);
      
      // Date
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Table Data
      const tableData = bills.map(bill => [
        bill.name,
        bill.isFixed ? 'Fixed' : 'Variable',
        typeof bill.amount === 'number' ? `£${bill.amount.toFixed(2)}` : '£0.00'
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Bill', 'Type', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, // blue-600
        styles: { fontSize: 11, cellPadding: 6 },
        columnStyles: {
          2: { halign: 'right', fontStyle: 'bold' }
        }
      });
      
      // Summary Section
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39); // gray-900
      doc.text('Total Bills:', 130, finalY + 15);
      doc.setFont(undefined, 'bold');
      doc.text(`£${total.toFixed(2)}`, 180, finalY + 15, { align: 'right' });
      
      doc.setFont(undefined, 'normal');
      doc.text('Each Pays (50%):', 130, finalY + 25);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text(`£${(total / 2).toFixed(2)}`, 180, finalY + 25, { align: 'right' });
      
      doc.save(`flatmate-bills-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('flatmate-bills', JSON.stringify(bills));
  }, [bills]);

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills(bills.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const clearUsageBills = () => {
    setBills(bills.map(b => b.isFixed ? b : { ...b, amount: '' }));
  };

  // calculations
  const total = useMemo(() => {
    return bills.reduce((acc, bill) => {
      return acc + (typeof bill.amount === 'number' ? bill.amount : 0);
    }, 0);
  }, [bills]);

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 overflow-hidden">
      <header className="bg-white border-b border-gray-200 shrink-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-center relative">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Split Bills</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Bills List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold text-lg">Monthly Bills</h2>
              <button 
                onClick={clearUsageBills}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear usage
              </button>
            </div>
            
            <div className="grid gap-3">
              {bills.map((bill, index) => {
                const Icon = ICONS[bill.icon] || Plus;
                return (
                  <motion.div 
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between gap-3 active:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 border ${bill.isFixed ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 truncate">{bill.name}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{bill.isFixed ? 'Fixed amount' : 'Depends on usage'}</p>
                      </div>
                    </div>
                    
                    <div className="relative shrink-0 w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                      <input 
                        type="number" 
                        value={bill.amount}
                        onChange={e => {
                          const val = e.target.value;
                          updateBill(bill.id, { amount: val === '' ? '' : parseFloat(val) });
                        }}
                        className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-900 transition-all placeholder:text-gray-400 placeholder:font-normal"
                        placeholder="0.00"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 shrink-0 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-md mx-auto px-4 pt-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Bills</p>
              <p className="text-xl font-semibold tracking-tight">£{total.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Each Pays</p>
              <p className="text-2xl font-bold tracking-tight text-blue-600">£{(total / 2).toFixed(2)}</p>
            </div>
          </div>
          
          <button 
            onClick={exportPDF}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-sm transition-all disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isExporting ? 'Generating PDF...' : 'Export PDF to Share'}
          </button>
        </div>
      </footer>
    </div>
  );
}
