import { Platform } from 'react-native';
import StorageService from './StorageService';

/**
 * WebMCPService identifies and registers tools for AI agents 
 * when the app is running in a WebMCP-capable browser.
 */
class WebMCPService {
    private isInitialized = false;

    public init() {
        if (this.isInitialized || Platform.OS !== 'web') {
            return;
        }

        // Wait for the polyfill/native API to be ready
        const registerTools = () => {
            const modelContext = (globalThis as any).navigator?.modelContext;
            if (!modelContext || !modelContext.registerTool) {
                console.log('WebMCP: API not found, retrying...');
                return;
            }

            console.log('WebMCP: Registering tools...');

            // 1. Start Timer Tool
            modelContext.registerTool({
                name: 'start_timer',
                description: 'Starts a specific focus or breathing timer',
                parameters: {
                    type: 'object',
                    properties: {
                        timerType: {
                            type: 'string',
                            enum: ['pomodoro', 'ignite', 'anchor'],
                            description: 'The type of timer to start',
                        },
                    },
                    required: ['timerType'],
                },
                execute: async ({ timerType }: { timerType: string }) => {
                    // In a real app, we'd trigger navigation or state change
                    // For now, we'll mark it as "requested" in storage or log it
                    console.log(`WebMCP: Requesting to start ${timerType} timer`);
                    return { success: true, message: `${timerType} timer requested` };
                },
            });

            // 2. Add Brain Dump Item
            modelContext.registerTool({
                name: 'add_brain_dump',
                description: 'Adds a new item to the user\'s brain dump',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'The text content to save',
                        },
                    },
                    required: ['text'],
                },
                execute: async ({ text }: { text: string }) => {
                    try {
                        const items = await StorageService.getJSON<any[]>(StorageService.STORAGE_KEYS.brainDump) || [];
                        const newItem = {
                            id: Date.now().toString(),
                            text,
                            timestamp: Date.now(),
                            type: 'text'
                        };
                        await StorageService.setJSON(StorageService.STORAGE_KEYS.brainDump, [newItem, ...items]);
                        return { success: true, item: newItem };
                    } catch (error) {
                        return { success: false, error: String(error) };
                    }
                },
            });

            this.isInitialized = true;
            console.log('WebMCP: Tools registered successfully');
        };

        // Check immediately and then on a short delay to account for polyfill loading
        registerTools();
        setTimeout(registerTools, 1000);
        setTimeout(registerTools, 3000);
    }
}

export default new WebMCPService();
