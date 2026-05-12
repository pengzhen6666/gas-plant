import React from 'react';
import { useFuelCalculator } from './FuelCalculator/useFuelCalculator';
import { HistoryTable } from './FuelCalculator/HistoryTable';
import { CalculatorModal } from './FuelCalculator/CalculatorModal';
import { ProfitVisualization } from './FuelCalculator/ProfitVisualization';

export const FuelCalculator: React.FC = () => {
  const { states, actions } = useFuelCalculator();

  return (
    <>
      <div className="space-y-6 animate-slide-up">
        <HistoryTable
          quotes={states.quotes}
          filterCategory={states.filterCategory}
          setFilterCategory={actions.setFilterCategory}
          fuelTypes={states.fuelTypes}
          isLoading={states.isLoading}
          unitType={states.unitType}
          onNewCalculation={() => {
            actions.clearAll();
            actions.setIsModalOpen(true);
          }}
          onApplyRecord={actions.applyHistoryRecord}
          onDeleteRecord={actions.deleteQuote}
        />
      </div>

      <CalculatorModal
        isOpen={states.isModalOpen}
        onClose={() => actions.setIsModalOpen(false)}
        editingId={states.editingId}
        states={states}
        actions={actions}
      >
        <ProfitVisualization results={states.results} />
      </CalculatorModal>
    </>
  );
};

export default FuelCalculator;
