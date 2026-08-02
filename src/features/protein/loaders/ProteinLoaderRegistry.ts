import type {
  ProteinLoadOptions,
  ProteinLoadResult,
  ProteinLoader,
  ProteinStructureFormat,
} from '@shared/types';
import { PdbProteinLoader } from './PdbProteinLoader';

function normalizeLoadOptions(
  formatOrOptions?: ProteinStructureFormat | ProteinLoadOptions,
): ProteinLoadOptions {
  if (typeof formatOrOptions === 'string') {
    return { format: formatOrOptions };
  }

  return formatOrOptions ?? {};
}

/**
 * Registry for protein loaders — add new formats (AlphaFold, etc.) here.
 */
export class ProteinLoaderRegistry {
  private readonly loaders = new Map<string, ProteinLoader>();

  constructor() {
    this.register(new PdbProteinLoader());
  }

  register(loader: ProteinLoader): void {
    for (const format of loader.supportedFormats) {
      this.loaders.set(format.toLowerCase(), loader);
    }
  }

  getLoader(format: ProteinStructureFormat): ProteinLoader {
    const loader = this.loaders.get(format.toLowerCase());
    if (!loader) {
      throw new Error(`No protein loader registered for format: ${format}`);
    }
    return loader;
  }

  /**
   * @param sourceId Structure identifier (RCSB entry ID today; format-agnostic for future loaders).
   * @param formatOrOptions Optional format hint. Defaults to PDB with mmCIF fallback in the RCSB loader.
   */
  async load(
    sourceId: string,
    formatOrOptions?: ProteinStructureFormat | ProteinLoadOptions,
  ): Promise<ProteinLoadResult> {
    const options = normalizeLoadOptions(formatOrOptions);
    const format = options.format ?? 'pdb';
    return this.getLoader(format).load(sourceId, options);
  }

  get supportedFormats(): ProteinStructureFormat[] {
    return [...this.loaders.keys()] as ProteinStructureFormat[];
  }
}

export const proteinLoaderRegistry = new ProteinLoaderRegistry();
