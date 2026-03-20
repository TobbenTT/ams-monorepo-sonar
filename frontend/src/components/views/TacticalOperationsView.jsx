import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import KpiControlPanel from '../tactical/KpiControlPanel';
import MaintenanceAnalysis from '../tactical/MaintenanceAnalysis';
import ImprovementPanel from '../tactical/ImprovementPanel';
import OperationalInsights from '../tactical/OperationalInsights';
import LateWorkOrdersDetail from '../tactical/LateWorkOrdersDetail';
import DeviationDetailDialog from '../tactical/DeviationDetailDialog';
import WorkOrderDetailDialog from '../tactical/WorkOrderDetailDialog';
import ActionDetailDialog from '../tactical/ActionDetailDialog';

export default function TacticalOperationsView({ selectedPlant, selectedTimeRange, selectedArea }) {
    const { t } = useLanguage();
    const [selectedDeviation, setSelectedDeviation] = useState(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [drillDownView, setDrillDownView] = useState(null);

    // If in drill-down view, show that screen
    if (drillDownView === 'late-work-orders') {
        return <LateWorkOrdersDetail onBack={() => setDrillDownView(null)} />;
    }

    return (
        <div className="bg-gray-50">
            <div className="p-6 space-y-6">
                {/* KPI Control Panel */}
                <div id="kpi-section">
                    <KpiControlPanel
                        selectedPlant={selectedPlant}
                        selectedTimeRange={selectedTimeRange}
                        onKpiClick={(category, kpi, workOrders) => {
                            if (kpi === 'Late Work Orders (%)') {
                                setDrillDownView('late-work-orders');
                            } else if (workOrders && workOrders.length > 0) {
                                setSelectedWorkOrder(workOrders[0]);
                            }
                        }}
                    />
                </div>

                {/* Operational Insights */}
                <div id="insights-section">
                    <OperationalInsights
                        selectedArea={selectedArea}
                        selectedPlant={selectedPlant}
                        onInsightClick={(insight) => {
                            if (insight.type === 'deviation') {
                                setSelectedDeviation(insight.data);
                            }
                        }}
                    />
                </div>

                {/* Maintenance Execution Analysis */}
                <div id="analysis-section">
                    <MaintenanceAnalysis
                        selectedArea={selectedArea}
                        onDeviationClick={setSelectedDeviation}
                        onWorkOrderClick={setSelectedWorkOrder}
                    />
                </div>

                {/* Continuous Improvement Panel */}
                <div id="improvement-section">
                    <ImprovementPanel
                        onActionClick={setSelectedAction}
                    />
                </div>
            </div>

            {/* Dialogs */}
            {selectedDeviation && (
                <DeviationDetailDialog
                    deviation={selectedDeviation}
                    open={!!selectedDeviation}
                    onClose={() => setSelectedDeviation(null)}
                    onCreateAction={(deviation) => {
                        setSelectedDeviation(null);
                        setSelectedAction({
                            id: 'NEW',
                            description: t('tactical.addressDeviation', { type: deviation.type, description: deviation.description }),
                            source: deviation.type,
                            owner: '',
                            dueDate: '',
                            status: t('common.draft')
                        });
                    }}
                />
            )}

            {selectedWorkOrder && (
                <WorkOrderDetailDialog
                    workOrder={selectedWorkOrder}
                    open={!!selectedWorkOrder}
                    onClose={() => setSelectedWorkOrder(null)}
                    onCreateAction={(wo) => {
                        setSelectedWorkOrder(null);
                        setSelectedAction({
                            id: 'NEW',
                            description: t('tactical.preventRecurrence', { type: wo.type }),
                            source: wo.rework ? t('tactical.rework') : t('tactical.delay'),
                            owner: '',
                            dueDate: '',
                            status: t('common.draft')
                        });
                    }}
                />
            )}

            {selectedAction && (
                <ActionDetailDialog
                    action={selectedAction}
                    open={!!selectedAction}
                    onClose={() => setSelectedAction(null)}
                    onSave={(action) => {
                        console.log(t('tactical.actionSaved'), action);
                        setSelectedAction(null);
                    }}
                />
            )}
        </div>
    );
}
