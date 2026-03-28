import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { AppLayout } from '../components/app-layout';
import { ContextPanel } from '../components/context-panel';
import { ScopeSelection } from '../components/scope-selector';
import {
  UserMessage,
  AITextMessage,
  MetricCard,
  AlertListCard,
  SubscriberCard,
  ActionCard,
  ReceiptCard,
  DeviceTableCard,
  TopologyCard,
  BandwidthChartCard,
  SpeedTestCard,
  OutageMapCard,
  ServicePlanCard,
  WorkOrderCard,
  SLAStatusCard,
  ProvisioningCard,
} from '../components/chat-messages';
import { ActionConfirmationModal } from '../components/action-confirmation-modal';
import { SubscriberQuickInspectDrawer } from '../components/subscriber-quick-inspect-drawer';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function CommandCenter() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInspectDrawer, setShowInspectDrawer] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentScope, setCurrentScope] = useState<ScopeSelection>({ level: 'all' });
  const [messages, setMessages] = useState<any[]>([
    {
      type: 'ai-text',
      message:
        'Hello! I\'m your AI operations assistant. How can I help you manage your network today?',
      timestamp: '10:23 AM',
    },
  ]);

  // Mouse tracking for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set((clientX - centerX) / 50);
      mouseY.set((clientY - centerY) / 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const navigate = useNavigate();

  const handleScopeChange = (scope: ScopeSelection) => {
    setCurrentScope(scope);
    
    // Add AI message about scope change
    const scopeMessage = getScopeChangeMessage(scope);
    setMessages((prev) => [
      ...prev,
      {
        type: 'ai-text',
        message: scopeMessage,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const getScopeChangeMessage = (scope: ScopeSelection): string => {
    switch (scope.level) {
      case 'all':
        return 'Now showing data for all tenants across all regions.';
      case 'region':
        return `Scope changed to ${scope.region} region. I can help you with operations in this region.`;
      case 'organization':
        return `Now focused on ${scope.organization}. What would you like to know about this organization?`;
      case 'subscriber':
        return `Viewing subscriber ${scope.subscriber}. I can show you their device topology, health metrics, and recent activity.`;
      default:
        return 'Scope updated.';
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userInput = input.toLowerCase();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        message: input,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ]);

    setInput('');
    setIsTyping(true);

    // Simulate AI response with different content based on input
    setTimeout(() => {
      setIsTyping(false);
      
      if (userInput.includes('device') || userInput.includes('gateway') || userInput.includes('list')) {
        // Show device table
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: 'Here\'s a summary of devices in your network:',
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
          {
            type: 'device-table',
          },
        ]);
      } else if (userInput.includes('topology') || userInput.includes('subscriber') || userInput.includes('john')) {
        // Show topology
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: 'Here\'s the network topology for the subscriber:',
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
          {
            type: 'topology',
          },
        ]);
      } else if (userInput.includes('chart') || userInput.includes('history') || userInput.includes('历史') || userInput.includes('bandwidth')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: "Here's your bandwidth usage for the last 7 days:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'bandwidth-chart' },
        ]);
      } else if (userInput.includes('speed test') || userInput.includes('speed') || userInput.includes('测速')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: 'Running speed test on your connection...', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'speed-test' },
        ]);
      } else if (userInput.includes('outage') || userInput.includes('故障') || userInput.includes('停服') || userInput.includes('down')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: 'Here are the currently active outages in your network:', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'outage-map' },
        ]);
      } else if (userInput.includes('plan') || userInput.includes('套餐')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: "Here's the current service plan for this subscriber:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'service-plan' },
        ]);
      } else if (userInput.includes('work order') || userInput.includes('ticket') || userInput.includes('工单')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: "I've created a work order for this issue:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'work-order' },
        ]);
      } else if (userInput.includes('sla') || userInput.includes('uptime') || userInput.includes('可用性')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: "Here's the current SLA compliance status:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'sla-status' },
        ]);
      } else if (userInput.includes('provision') || userInput.includes('开通') || userInput.includes('新用户')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: "Here's the provisioning status for the new subscriber:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
          { type: 'provisioning' },
        ]);
      } else {
        // Default response
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: 'I\'ve analyzed your request. Here\'s what I found:',
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
          {
            type: 'metric',
          },
          {
            type: 'alerts',
          },
          {
            type: 'subscriber',
          },
          {
            type: 'action',
          },
        ]);
      }
    }, 1500);
  };

  const handleConfirmAction = () => {
    setShowConfirmModal(false);
    toast.success('Action initiated');

    // Add receipt card
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'receipt',
        },
      ]);
    }, 500);
  };

  const renderMessage = (msg: any, idx: number) => {
    switch (msg.type) {
      case 'user':
        return <UserMessage key={idx} message={msg.message} timestamp={msg.timestamp} />;
      
      case 'ai-text':
        return <AITextMessage key={idx} message={msg.message} timestamp={msg.timestamp} />;
      
      case 'metric':
        return (
          <MetricCard
            key={idx}
            title="Average Network Quality"
            value="87.3%"
            change="+2.3% vs yesterday"
            changeType="positive"
            timestamp="10:24 AM"
            source="Network Analytics Engine"
          />
        );
      
      case 'alerts':
        return (
          <AlertListCard
            key={idx}
            alerts={[
              {
                id: '1',
                severity: 'critical',
                message: 'Gateway GW-4521 offline',
                count: 1,
              },
              {
                id: '2',
                severity: 'medium',
                message: 'High interference on channel 6',
                count: 3,
              },
              {
                id: '3',
                severity: 'low',
                message: 'Firmware updates available',
                count: 12,
              },
            ]}
            timestamp="10:24 AM"
            source="Alert Management System"
          />
        );
      
      case 'subscriber':
        return (
          <SubscriberCard
            key={idx}
            subscriberId="SUB-7834"
            name="John Smith"
            status="degraded"
            healthScore={73}
            devices={5}
            timestamp="10:24 AM"
            source="Subscriber Database"
            onInspect={() => setShowInspectDrawer(true)}
          />
        );
      
      case 'action':
        return (
          <ActionCard
            key={idx}
            title="Restart Gateway GW-4521"
            description="This will temporarily disconnect the subscriber for 30-60 seconds during restart."
            riskLevel="medium"
            primaryAction="Execute"
            secondaryAction="Schedule"
            timestamp="10:24 AM"
            source="Action Recommendation Engine"
            onPrimaryAction={() => setShowConfirmModal(true)}
          />
        );
      
      case 'receipt':
        return (
          <ReceiptCard
            key={idx}
            action="Gateway Restart Completed"
            status="success"
            details={[
              { label: 'Device', value: 'GW-4521-A' },
              { label: 'Duration', value: '45 seconds' },
              { label: 'Subscriber', value: 'SUB-7834' },
            ]}
            correlationId="act-2024-03-27-1024-7834"
            timestamp="10:25 AM"
            source="Gateway Management System"
            onViewAudit={() => navigate('/audit')}
          />
        );
      
      case 'device-table':
        return (
          <DeviceTableCard
            key={idx}
            title="Downtown Region Devices"
            devices={[
              {
                id: 'GW-4521',
                name: 'Gateway Downtown-01',
                type: 'gateway',
                status: 'online',
                location: 'Main St & 5th Ave',
                uptime: '45d 12h',
                firmware: 'v2.4.1',
              },
              {
                id: 'GW-4522',
                name: 'Gateway Downtown-02',
                type: 'gateway',
                status: 'degraded',
                location: 'Park Ave & 3rd St',
                uptime: '23d 8h',
                firmware: 'v2.4.0',
              },
              {
                id: 'RT-1245',
                name: 'Router Central Hub',
                type: 'router',
                status: 'online',
                location: 'City Center',
                uptime: '89d 5h',
                firmware: 'v3.1.2',
              },
              {
                id: 'AP-8821',
                name: 'Access Point East',
                type: 'ap',
                status: 'online',
                location: 'East District',
                uptime: '12d 3h',
                firmware: 'v1.8.5',
              },
              {
                id: 'GW-4523',
                name: 'Gateway West Zone',
                type: 'gateway',
                status: 'offline',
                location: 'West End Plaza',
                uptime: '0d 0h',
                firmware: 'v2.3.9',
              },
            ]}
            timestamp="10:24 AM"
            source="Device Management System"
          />
        );
      
      case 'topology':
        return (
          <TopologyCard
            key={idx}
            subscriberId="SUB-7834"
            subscriberName="John Smith"
            gateway={{
              id: 'GW-4521-A',
              name: 'Gateway Downtown-01',
              status: 'online',
            }}
            devices={[
              {
                id: 'DEV-001',
                name: 'iPhone 14',
                type: 'smartphone',
                status: 'online',
                connection: '5GHz',
              },
              {
                id: 'DEV-002',
                name: 'MacBook Pro',
                type: 'laptop',
                status: 'online',
                connection: '5GHz',
              },
              {
                id: 'DEV-003',
                name: 'Smart TV',
                type: 'other',
                status: 'online',
                connection: 'Ethernet',
              },
              {
                id: 'DEV-004',
                name: 'iPad Air',
                type: 'tablet',
                status: 'online',
                connection: '2.4GHz',
              },
              {
                id: 'DEV-005',
                name: 'Desktop PC',
                type: 'desktop',
                status: 'offline',
                connection: 'Ethernet',
              },
            ]}
            timestamp="10:24 AM"
            source="Network Topology Service"
          />
        );

      case 'bandwidth-chart':
        return <BandwidthChartCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Network Analytics Engine" />;

      case 'speed-test':
        return <SpeedTestCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Speed Test Service" />;

      case 'outage-map':
        return <OutageMapCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="NOC Monitoring System" />;

      case 'service-plan':
        return <ServicePlanCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Billing System" />;

      case 'work-order':
        return <WorkOrderCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Ticketing System" />;

      case 'sla-status':
        return <SLAStatusCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="SLA Management System" />;

      case 'provisioning':
        return <ProvisioningCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Provisioning Service" />;

      default:
        return null;
    }
  };

  return (
    <AppLayout 
      rightPanel={<ContextPanel />} 
      scopeIndicator="Acme ISP • All Regions"
      onScopeChange={handleScopeChange}
    >
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Animated background with parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: 'radial-gradient(circle at 50% 50%, var(--primary), transparent 70%)',
              x: smoothMouseX,
              y: smoothMouseY,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.05, 0.03],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: 'var(--primary)',
                left: `${20 + i * 20}%`,
                top: `${30 + i * 15}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-auto p-6 relative z-10">
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center py-12"
              style={{
                x: smoothMouseX,
                y: smoothMouseY,
              }}
            >
              {/* Tech header with animated icon */}
              <motion.div
                className="inline-flex items-center gap-2 mb-6"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Sparkles className="h-8 w-8" style={{ color: 'var(--primary)' }} />
                </motion.div>
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                  AI Command Center
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
                style={{ color: 'var(--neutral-500)' }}
              >
                Ask me anything about your network operations. I can help you:
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto mb-8">
                <SuggestionCard
                  title="Show device list"
                  onClick={() => {
                    const message = 'Show me all devices in downtown region';
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: 'user',
                        message: message,
                        timestamp: new Date().toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                      },
                    ]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [
                        ...prev,
                        {
                          type: 'ai-text',
                          message: 'Here\'s a summary of devices in your network:',
                          timestamp: new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          }),
                        },
                        {
                          type: 'device-table',
                        },
                      ]);
                    }, 1500);
                  }}
                  delay={0.1}
                />
                <SuggestionCard
                  title="View network topology"
                  onClick={() => {
                    const message = 'Show topology for subscriber John Smith';
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: 'user',
                        message: message,
                        timestamp: new Date().toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                      },
                    ]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [
                        ...prev,
                        {
                          type: 'ai-text',
                          message: 'Here\'s the network topology for the subscriber:',
                          timestamp: new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          }),
                        },
                        {
                          type: 'topology',
                        },
                      ]);
                    }, 1500);
                  }}
                  delay={0.2}
                />
                <SuggestionCard
                  title="Analyze subscriber issues"
                  onClick={() => {
                    const message = 'Show subscribers with degraded service';
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: 'user',
                        message: message,
                        timestamp: new Date().toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                      },
                    ]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [
                        ...prev,
                        {
                          type: 'ai-text',
                          message: 'I\'ve analyzed your request. Here\'s what I found:',
                          timestamp: new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          }),
                        },
                        {
                          type: 'metric',
                        },
                        {
                          type: 'alerts',
                        },
                        {
                          type: 'subscriber',
                        },
                        {
                          type: 'action',
                        },
                      ]);
                    }, 1500);
                  }}
                  delay={0.3}
                />
                <SuggestionCard
                  title="Optimize WiFi channels"
                  onClick={() => {
                    const message = 'Optimize WiFi channels in downtown region';
                    setMessages((prev) => [
                      ...prev,
                      {
                        type: 'user',
                        message: message,
                        timestamp: new Date().toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                      },
                    ]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [
                        ...prev,
                        {
                          type: 'ai-text',
                          message: 'I\'ve analyzed channel usage. Here are my recommendations:',
                          timestamp: new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          }),
                        },
                        {
                          type: 'metric',
                        },
                        {
                          type: 'alerts',
                        },
                        {
                          type: 'action',
                        },
                      ]);
                    }, 1500);
                  }}
                  delay={0.4}
                />
                <SuggestionCard
                  title="Bandwidth History"
                  onClick={() => {
                    const message = 'Show bandwidth history';
                    setMessages((prev) => [...prev, { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [...prev,
                        { type: 'ai-text', message: "Here's your bandwidth usage for the last 7 days:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
                        { type: 'bandwidth-chart' },
                      ]);
                    }, 1500);
                  }}
                  delay={0.5}
                />
                <SuggestionCard
                  title="Run Speed Test"
                  onClick={() => {
                    const message = 'Run speed test';
                    setMessages((prev) => [...prev, { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [...prev,
                        { type: 'ai-text', message: 'Running speed test on your connection...', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
                        { type: 'speed-test' },
                      ]);
                    }, 1500);
                  }}
                  delay={0.6}
                />
                <SuggestionCard
                  title="Active Outages"
                  onClick={() => {
                    const message = 'Show active outages';
                    setMessages((prev) => [...prev, { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [...prev,
                        { type: 'ai-text', message: 'Here are the currently active outages in your network:', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
                        { type: 'outage-map' },
                      ]);
                    }, 1500);
                  }}
                  delay={0.7}
                />
                <SuggestionCard
                  title="Current Plan"
                  onClick={() => {
                    const message = 'Show current plan';
                    setMessages((prev) => [...prev, { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
                    setIsTyping(true);
                    setTimeout(() => {
                      setIsTyping(false);
                      setMessages((prev) => [...prev,
                        { type: 'ai-text', message: "Here's the current service plan for this subscriber:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
                        { type: 'service-plan' },
                      ]);
                    }, 1500);
                  }}
                  delay={0.8}
                />
              </div>
            </motion.div>
          )}

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: idx * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  {renderMessage(msg, idx)}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AITextMessage
                  message=""
                  timestamp=""
                  isTyping={true}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Message Input with tech effects */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="border-t p-4 relative z-10"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-base)',
          }}
        >
          {/* Animated glow when focused */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-0 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                  boxShadow: '0 0 20px var(--primary)',
                }}
              />
            )}
          </AnimatePresence>

          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <motion.input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask about network status, subscribers, or request actions..."
                  className="w-full px-4 py-3 rounded-lg border bg-transparent transition-all"
                  style={{
                    borderColor: isFocused ? 'var(--primary)' : 'var(--border)',
                    borderRadius: 'var(--radius-control)',
                    boxShadow: isFocused ? '0 0 0 1px var(--primary)' : 'none',
                  }}
                  whileFocus={{ scale: 1.01 }}
                />
                
                {/* Input particle effect when typing */}
                <AnimatePresence>
                  {input.length > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.5 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-6 relative overflow-hidden group"
                  style={{
                    background: input.trim() ? 'var(--primary)' : 'var(--disabled-bg)',
                    color: input.trim() ? 'var(--primary-foreground)' : 'var(--disabled-text)',
                    borderRadius: 'var(--radius-control)',
                  }}
                >
                  {/* Button glow effect */}
                  {input.trim() && (
                    <motion.div
                      className="absolute inset-0 opacity-50"
                      animate={{
                        background: [
                          'radial-gradient(circle at 0% 50%, var(--primary) 0%, transparent 50%)',
                          'radial-gradient(circle at 100% 50%, var(--primary) 0%, transparent 50%)',
                          'radial-gradient(circle at 0% 50%, var(--primary) 0%, transparent 50%)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                  <Send className="h-4 w-4 relative z-10" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals & Drawers */}
      <ActionConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        action={{
          title: 'Restart Gateway',
          description: 'This action will restart gateway GW-4521-A to resolve connectivity issues.',
          scope: '1 Gateway • Subscriber SUB-7834 (John Smith)',
          expectedImpact: 'Service interruption of 30-60 seconds. Subscriber will experience brief disconnect.',
          rollbackHint: 'If issues persist after restart, escalate to Tier-2 support for hardware diagnostics.',
          riskLevel: 'medium',
        }}
      />

      <SubscriberQuickInspectDrawer
        isOpen={showInspectDrawer}
        onClose={() => setShowInspectDrawer(false)}
        subscriber={{
          id: 'SUB-7834',
          name: 'John Smith',
          healthScore: 73,
          devices: [
            {
              id: 'DEV-001',
              name: 'iPhone 14',
              type: 'smartphone',
              rssi: -68,
              phy: '802.11ax',
              traffic: '1.2 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-002',
              name: 'MacBook Pro',
              type: 'laptop',
              rssi: -52,
              phy: '802.11ax',
              traffic: '4.5 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-003',
              name: 'Smart TV',
              type: 'other',
              rssi: -74,
              phy: '802.11ac',
              traffic: '8.3 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-004',
              name: 'iPad Air',
              type: 'smartphone',
              rssi: -65,
              phy: '802.11ax',
              traffic: '2.1 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-005',
              name: 'Desktop PC',
              type: 'desktop',
              rssi: -58,
              phy: '802.11ax',
              traffic: '6.7 GB/day',
              status: 'offline',
            },
          ],
          wifiKpis: {
            avgRssi: '-63 dBm',
            avgPhy: '802.11ax',
            packetLoss: '0.8%',
            latency: '12ms',
          },
          recentAnomalies: [
            {
              time: '2 hours ago',
              description: 'Intermittent connection drops detected',
              severity: 'medium',
            },
            {
              time: '5 hours ago',
              description: 'High packet loss on 5GHz band',
              severity: 'high',
            },
            {
              time: 'Yesterday',
              description: 'Gateway firmware updated',
              severity: 'low',
            },
          ],
        }}
      />
    </AppLayout>
  );
}

interface SuggestionCardProps {
  title: string;
  onClick: () => void;
  delay?: number;
}

function SuggestionCard({ title, onClick, delay = 0 }: SuggestionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ 
        scale: 1.03,
        y: -2,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-lg border text-left transition-all relative overflow-hidden group"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-control)',
      }}
    >
      {/* Hover gradient effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
        style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        }}
      />
      
      {/* Border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: '0 0 20px var(--primary)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-control)',
        }}
      />

      <span className="text-sm font-medium relative z-10" style={{ color: 'var(--foreground)' }}>
        {title}
      </span>
    </motion.button>
  );
}