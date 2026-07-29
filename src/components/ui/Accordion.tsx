import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export const Accordion = ({ title, children, isOpen = false }: AccordionProps) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
      >
        <span className="text-lg font-semibold text-text">{title}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-text-secondary flex-shrink-0 ml-4"
        >
          <FiChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 text-text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
