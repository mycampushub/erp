import { useCallback, useEffect, useState } from 'react';

export interface VoiceAssistantHook {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isActive: boolean;
  teachAbout: (module: string, content?: string) => void;
  generateEducationalContent: (module: string, detail?: string) => string;
}

export const useVoiceAssistant = (): VoiceAssistantHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis!.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          
          const femaleVoice = availableVoices.find(
            voice => voice.name.includes('Female') || 
                    voice.name.includes('female') || 
                    voice.name.includes('Samantha') ||
                    (voice.name.includes('Google') && voice.lang.includes('en-US'))
          );
          
          const englishVoice = availableVoices.find(
            voice => voice.lang.includes('en')
          );
          
          setPreferredVoice(femaleVoice || englishVoice || availableVoices[0]);
        }
      };
      
      loadVoices();
      
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);

  useEffect(() => {
    if (speechQueue.length > 0 && !isSpeaking && speechSynthesis) {
      const text = speechQueue[0];
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsActive(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeechQueue(current => current.slice(1));
        if (speechQueue.length <= 1) {
          setIsActive(false);
        }
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeechQueue(current => current.slice(1));
        if (speechQueue.length <= 1) {
          setIsActive(false);
        }
      };
      
      try {
        speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        setSpeechQueue([]);
      }
    }
  }, [speechQueue, isSpeaking, speechSynthesis, preferredVoice]);

  const speak = useCallback((text: string) => {
    if (!text || !text.trim()) {
      return;
    }
    
    if (speechSynthesis) {
      try {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeechQueue([text]);
      } catch {
        setSpeechQueue(current => [...current, text]);
      }
    } else {
      setSpeechQueue(current => [...current, text]);
    }
  }, [speechSynthesis]);

  const stop = useCallback(() => {
    if (speechSynthesis) {
      try {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeechQueue([]);
        setIsActive(false);
      } catch {
        // Ignore errors
      }
    }
  }, [speechSynthesis]);

  const generateEducationalContent = useCallback((module: string, detail?: string): string => {
    const educationalContent: Record<string, string> = {
      "finance": `The Finance module in SAP S/4HANA provides comprehensive financial management capabilities. It includes General Ledger for real-time financial postings, Accounts Payable for vendor invoice processing and payments, Accounts Receivable for customer billing and collections, Asset Accounting for fixed asset management, Cost Center Accounting for internal cost allocation, Cash Management for liquidity planning, and Financial Planning for budgeting and forecasting. The module uses the Universal Journal for simplified data model and provides real-time financial insights with embedded analytics.`,
      
      "sales": `The Sales module in SAP S/4HANA manages the complete order-to-cash process. It includes Customer Management for maintaining customer master data, Sales Order Processing for order creation and fulfillment, Quotation Management for price quotes and proposals, Contract Management for framework agreements, Pricing for dynamic pricing strategies, Product Catalog for product information management, Billing for invoice creation, Credit Management for credit limit monitoring, Returns Processing for handling customer returns, Commission Management for sales representative compensation, Territory Management for sales area organization, and Sales Analytics for performance insights.`,
      
      "procurement": `The Procurement module handles the complete procure-to-pay process in SAP S/4HANA. It includes Purchase Requisitions for internal purchase requests, Purchase Orders for vendor ordering, Supplier Management for vendor master data and relationships, Contracts for procurement agreements, Source List for approved vendor lists, RFQ Management for quote solicitation, Invoice Verification for three-way matching, Catalog Management for punch-out catalogs, Spend Analysis for procurement insights, Supplier Performance for vendor evaluation, and Contract Management for agreement lifecycle management.`,
      
      "manufacturing": `The Manufacturing module in SAP S/4HANA supports discrete and process manufacturing. It includes Production Planning for demand-driven planning, Production Scheduling for capacity and resource planning, Material Requirements Planning for component planning, Work Centers for resource management, Bills of Materials for product structures, Routings for operation sequences, Quality Management for quality control, Maintenance for equipment management, Warehouse Management for shop floor inventory, Cost Analysis for manufacturing cost control, Performance Analytics for OEE monitoring, and Production Reports for operational insights.`,
      
      "supply-chain": `The Supply Chain module provides end-to-end supply chain visibility and control. It includes Inventory Management for stock optimization, Warehouse Management for efficient storage and picking, Transportation Management for logistics optimization, Demand Planning for forecast accuracy, Supply Planning for replenishment strategies, Distribution Planning for network optimization, Physical Inventory for cycle counting, Stock Transfers for inter-plant movements, Inbound and Outbound Deliveries for goods receipt and dispatch, and Vendor Managed Inventory for supplier-managed stock.`,
      
      "project": `Project Management in SAP S/4HANA provides comprehensive project lifecycle management. It includes Project Planning for work breakdown structures, Project Execution for progress tracking, Resource Management for capacity planning, Time Recording for effort capture, Cost Management for budget control, Risk Management for issue mitigation, Document Management for project artifacts, Portfolio Management for strategic alignment, Collaboration for team communication, and Project Analytics for performance insights.`,
      
      "human-resources": `Human Resources in SAP S/4HANA provides comprehensive workforce management including employee central for master data, organizational management, time and attendance tracking, payroll processing, and talent management. The system supports global HR processes with localized compliance requirements and self-service capabilities for employees and managers.`,
      
      "business-intelligence": `Business Intelligence in SAP S/4HANA provides real-time analytics and reporting capabilities with embedded analytics directly in business processes. The system offers self-service analytics, predictive modeling, and interactive dashboards. Key features include drill-down analysis, what-if scenarios, and mobile analytics for decision-making.`,
      
      "maintenance": `The Maintenance module ensures optimal equipment performance and reliability. It includes Preventive Maintenance for scheduled maintenance, Corrective Maintenance for breakdown repairs, Predictive Maintenance using IoT sensors, Work Order Management for maintenance tasks, Equipment Master for asset information, Maintenance Planning for resource scheduling, Spare Parts Management for inventory control, and Maintenance Analytics for performance monitoring.`,
      
      "default": `SAP S/4HANA is a next-generation ERP suite built on the SAP HANA in-memory platform. It combines transactional and analytical processing in real-time, enabling instant insights and intelligent automation. The system features a simplified data model with the Universal Journal, embedded analytics with SAP Analytics Cloud integration, intelligent technologies including machine learning and artificial intelligence, cloud-ready architecture for hybrid deployments, and a modern user experience with SAP Fiori apps.`
    };
    
    const content = educationalContent[module.toLowerCase()] || educationalContent.default;
    
    if (detail) {
      return `${detail} ${content}`;
    }
    
    return content;
  }, []);

  const teachAbout = useCallback((module: string, content?: string) => {
    const educationalContent = generateEducationalContent(module, content);
    speak(educationalContent);
  }, [generateEducationalContent, speak]);

  return {
    speak,
    stop,
    isSpeaking,
    isActive: speechQueue.length > 0 || isSpeaking,
    teachAbout,
    generateEducationalContent
  };
};
