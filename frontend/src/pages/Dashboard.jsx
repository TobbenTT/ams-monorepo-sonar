import { useOutletContext } from 'react-router-dom';
import ExecutiveView from '../components/views/ExecutiveView';
import TacticalOperationsView from '../components/views/TacticalOperationsView';

export default function Dashboard() {
    const { viewMode, plant, selectedTimeRange, selectedArea } = useOutletContext();

    return viewMode === 'executive' ? (
        <ExecutiveView
            selectedPlant={plant}
            selectedTimeRange={selectedTimeRange}
            selectedArea={selectedArea}
        />
    ) : (
        <TacticalOperationsView
            selectedPlant={plant}
            selectedTimeRange={selectedTimeRange}
            selectedArea={selectedArea}
        />
    );
}
