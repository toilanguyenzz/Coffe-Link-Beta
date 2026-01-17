import React, { useState, useCallback } from 'react';
import SmartInputModal from '../modals/SmartInputModal';
import AnalysisResultModal from '../modals/AnalysisResultModal';
import DataEnrichmentModal from '../modals/DataEnrichmentModal';

// Types
type AreaUnitId = 'hecta' | 'sao_bac_bo' | 'sao_tay_nguyen' | 'cong_dat';
type CoffeeTypeId = 'robusta' | 'arabica' | 'chari';
type FlowStep = 'idle' | 'smart_input' | 'drawing' | 'analysis' | 'enrichment' | 'complete';

export interface FarmSetupData {
    targetAreaHa: number;
    targetAreaM2: number;
    targetDisplayValue: number;
    targetUnitId: AreaUnitId;
    drawnPolygon: number[][];
    drawnAreaHa: number;
    hasRedBook: boolean;
    redBookImage?: string;
    treeCount: number;
    coffeeType: CoffeeTypeId;
}

interface FarmSetupFlowProps {
    center: [number, number];
    markerPosition: [number, number];
    onComplete: (data: FarmSetupData) => void;
    onCancel: () => void;
    children: (props: {
        startFlow: () => void;
        isInFlow: boolean;
        currentStep: FlowStep;
        farmData: Partial<FarmSetupData>;
        targetAreaHa: number | null;
        onDrawingComplete: (polygon: number[][], areaHa: number) => void;
    }) => React.ReactNode;
}

const FarmSetupFlow: React.FC<FarmSetupFlowProps> = ({
    center,
    markerPosition,
    onComplete,
    onCancel,
    children,
}) => {
    const [currentStep, setCurrentStep] = useState<FlowStep>('idle');
    const [farmData, setFarmData] = useState<Partial<FarmSetupData>>({});

    // Start the flow
    const startFlow = useCallback(() => {
        setCurrentStep('smart_input');
        setFarmData({});
    }, []);

    // Handle Smart Input completion
    const handleSmartInputComplete = useCallback((
        targetAreaHa: number,
        targetAreaM2: number,
        displayValue: number,
        unitId: AreaUnitId
    ) => {
        setFarmData(prev => ({
            ...prev,
            targetAreaHa,
            targetAreaM2,
            targetDisplayValue: displayValue,
            targetUnitId: unitId,
        }));
        setCurrentStep('drawing');
    }, []);

    // Handle Drawing completion (called from parent component)
    const handleDrawingComplete = useCallback((polygon: number[][], areaHa: number) => {
        setFarmData(prev => ({
            ...prev,
            drawnPolygon: polygon,
            drawnAreaHa: areaHa,
        }));
        setCurrentStep('analysis');
    }, []);

    // Handle Analysis completion
    const handleAnalysisComplete = useCallback((hasRedBook: boolean, redBookImage?: string) => {
        setFarmData(prev => ({
            ...prev,
            hasRedBook,
            redBookImage,
        }));
        setCurrentStep('enrichment');
    }, []);

    // Handle Data Enrichment completion
    const handleEnrichmentComplete = useCallback((treeCount: number, coffeeType: CoffeeTypeId) => {
        const finalData: FarmSetupData = {
            targetAreaHa: farmData.targetAreaHa || 0,
            targetAreaM2: farmData.targetAreaM2 || 0,
            targetDisplayValue: farmData.targetDisplayValue || 0,
            targetUnitId: farmData.targetUnitId || 'hecta',
            drawnPolygon: farmData.drawnPolygon || [],
            drawnAreaHa: farmData.drawnAreaHa || 0,
            hasRedBook: farmData.hasRedBook || false,
            redBookImage: farmData.redBookImage,
            treeCount,
            coffeeType,
        };

        setFarmData(finalData);
        setCurrentStep('complete');
        onComplete(finalData);
    }, [farmData, onComplete]);

    // Cancel flow
    const handleCancel = useCallback(() => {
        setCurrentStep('idle');
        setFarmData({});
        onCancel();
    }, [onCancel]);

    const isInFlow = currentStep !== 'idle' && currentStep !== 'complete';

    return (
        <>
            {/* Render children with flow props */}
            {children({
                startFlow,
                isInFlow,
                currentStep,
                farmData,
                targetAreaHa: farmData.targetAreaHa || null,
                onDrawingComplete: handleDrawingComplete,
            })}

            {/* Smart Input Modal (Screen 1) */}
            <SmartInputModal
                isOpen={currentStep === 'smart_input'}
                onClose={handleCancel}
                onStart={handleSmartInputComplete}
            />

            {/* Analysis Result Modal (Screen 3) */}
            <AnalysisResultModal
                isOpen={currentStep === 'analysis'}
                drawnAreaHa={farmData.drawnAreaHa || 0}
                targetAreaHa={farmData.targetAreaHa || 0}
                farmPolygon={farmData.drawnPolygon || []}
                onContinue={handleAnalysisComplete}
                onClose={handleCancel}
            />

            {/* Data Enrichment Modal (Screen 4) */}
            <DataEnrichmentModal
                isOpen={currentStep === 'enrichment'}
                areaHa={farmData.drawnAreaHa || 0}
                onComplete={handleEnrichmentComplete}
                onClose={handleCancel}
            />
        </>
    );
};

export default FarmSetupFlow;
