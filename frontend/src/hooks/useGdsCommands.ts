import { useState, useEffect, useCallback } from 'react';
import { type GdsCommand } from '../types';

const GDS_COMMAND_STORAGE_KEY = 'TKT_ASSISTANT_GDS_COMMANDS';

const defaultCommands: GdsCommand[] = [
  { id: 1, name: 'Hiển thị PNR', command: 'RT' },
  { id: 2, name: 'Kiểm tra giá vé', command: 'FXX' },
  { id: 3, name: 'Tạo TST từ báo giá', command: 'TTP' },
  { id: 4, name: 'Lịch sử PNR', command: 'RH' },
];

export const useGdsCommands = () => {
  const [commands, setCommands] = useState<GdsCommand[]>([]);

  useEffect(() => {
    try {
      const storedCommands = localStorage.getItem(GDS_COMMAND_STORAGE_KEY);
      if (storedCommands) {
        setCommands(JSON.parse(storedCommands));
      } else {
        // Load default commands for first-time users
        setCommands(defaultCommands);
      }
    } catch (error) {
      console.error("Failed to load GDS commands from localStorage", error);
      setCommands(defaultCommands); // Fallback to defaults
    }
  }, []);

  useEffect(() => {
    if (commands.length > 0 || localStorage.getItem(GDS_COMMAND_STORAGE_KEY)) {
        try {
            localStorage.setItem(GDS_COMMAND_STORAGE_KEY, JSON.stringify(commands));
        } catch (error) {
            console.error("Failed to save GDS commands to localStorage", error);
        }
    }
  }, [commands]);

  const addCommand = useCallback((name: string, command: string) => {
    const newCommand: GdsCommand = {
      id: Date.now(),
      name: name.trim(),
      command: command.trim(),
    };
    setCommands(prev => [newCommand, ...prev]);
  }, []);

  const deleteCommand = useCallback((id: number) => {
    setCommands(prev => prev.filter(cmd => cmd.id !== id));
  }, []);

  return { commands, addCommand, deleteCommand };
};