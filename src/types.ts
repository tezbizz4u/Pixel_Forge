/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolCategory = 'Essential' | 'Aesthetic' | 'Text' | 'Technical' | 'Creative';

export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  type: string;
  name: string;
  size: number;
}
