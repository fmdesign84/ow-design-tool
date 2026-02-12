import type { NodeCategory, NodeDefinition } from '../types';
import { ioNodes } from './io';
import {
  designGenerationNodes,
  imageGenerationNodes,
  videoGenerationNodes,
} from './generation';
import { editingNodes } from './editing';
import { analysisNodes } from './analysis';
import { utilityNodes } from './utility';

export type NodeCatalogEntry = {
  id: string;
  category: NodeCategory;
  description?: string;
  nodes: NodeDefinition[];
};

export const defaultNodeCatalog: NodeCatalogEntry[] = [
  {
    id: 'generation-design',
    category: 'generation',
    description: '디자인 생성 번들',
    nodes: designGenerationNodes,
  },
  {
    id: 'generation-image',
    category: 'generation',
    description: '이미지 생성 번들',
    nodes: imageGenerationNodes,
  },
  {
    id: 'generation-video',
    category: 'generation',
    description: '영상 생성 번들',
    nodes: videoGenerationNodes,
  },
  { id: 'editing-core', category: 'editing', nodes: editingNodes },
  { id: 'analysis-core', category: 'analysis', nodes: analysisNodes },
  { id: 'utility-core', category: 'utility', nodes: utilityNodes },
  { id: 'io-core', category: 'io', nodes: ioNodes },
];

export function flattenNodeCatalog(catalog: NodeCatalogEntry[]): NodeDefinition[] {
  return catalog.flatMap(entry => entry.nodes);
}
