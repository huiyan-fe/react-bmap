import React from 'react';

export interface DemoItem {
  Component?: React.FC;
  code: string;
}

const demos: Record<string, DemoItem> = {};

export function registerDemo(id: string, item: DemoItem) {
  demos[id] = item;
}

export function getDemoById(id: string): DemoItem | undefined {
  return demos[id];
}

export function getAllDemoIds(): string[] {
  return Object.keys(demos);
}
