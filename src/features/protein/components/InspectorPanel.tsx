import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { GlassPanel, HudPanelHeader } from '@shared/components';
import {
  DEFAULT_NEIGHBOR_RADIUS_ANGSTROM,
  geometryAnalysisEngine,
} from '../analysis';
import {
  buildHydrogenBondInspectorRows,
  buildInteractionQuery,
  getHydrogenBondInteractions,
  hydrogenBondEmptyMessage,
  interactionEngine,
} from '../analysis/interactions';
import { useProtein } from '../hooks/useProtein';
import { useSelection } from '../hooks/useSelection';
import { useStructureModel } from '../hooks/useStructureModel';
import { MAX_ATOM_SELECTIONS } from '../types/selection.types';

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start justify-between gap-4 border-b border-aura-border/50 py-2.5 last:border-0"
    >
      <span className="text-[10px] tracking-wider text-aura-text-muted uppercase">
        {label}
      </span>
      <span className="max-w-[58%] text-right font-mono text-xs leading-snug text-aura-text">
        {value}
      </span>
    </motion.div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <p className="pt-2 pb-1 text-[10px] font-medium tracking-widest text-aura-cyan uppercase">
      {title}
    </p>
  );
}

function formatCoord(value: number): string {
  return value.toFixed(2);
}

function formatVector(vector: { x: number; y: number; z: number }): string {
  return `(${formatCoord(vector.x)}, ${formatCoord(vector.y)}, ${formatCoord(vector.z)})`;
}

function secondaryStructureLabel(type: string | undefined): string {
  if (!type) return 'coil';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const UNAVAILABLE = '—';

/**
 * Right-side inspector for the current molecular selection.
 */
export function InspectorPanel() {
  const { status } = useProtein();
  const structureModel = useStructureModel();
  const { selectionType, selectedObject, atomSelections, clearSelection } = useSelection();

  const distanceMeasurement = useMemo(() => {
    if (atomSelections.length < 2) {
      return null;
    }
    return geometryAnalysisEngine.distance(
      atomSelections[0].atom,
      atomSelections[1].atom,
    );
  }, [atomSelections]);

  const neighborResidues = useMemo(() => {
    if (!structureModel || selectedObject?.type !== 'residue') {
      return [];
    }
    return geometryAnalysisEngine.findNeighborResidues(structureModel.model, {
      residue: selectedObject.residue,
      chainId: selectedObject.chainId,
      radiusAngstrom: DEFAULT_NEIGHBOR_RADIUS_ANGSTROM,
    });
  }, [selectedObject, structureModel]);

  const interactionOutput = useMemo(() => {
    if (!structureModel) {
      return null;
    }
    const query = buildInteractionQuery(
      structureModel.model,
      selectedObject,
      atomSelections,
      DEFAULT_NEIGHBOR_RADIUS_ANGSTROM,
    );
    if (!query) {
      return null;
    }
    return interactionEngine.analyze(query);
  }, [atomSelections, selectedObject, structureModel]);

  const hydrogenBonds = useMemo(
    () => getHydrogenBondInteractions(interactionOutput?.interactions ?? []),
    [interactionOutput],
  );

  const hydrogenBondMessage = useMemo(
    () => hydrogenBondEmptyMessage(interactionOutput?.interactions ?? []),
    [interactionOutput],
  );

  if (status !== 'loaded') {
    return null;
  }

  const activeAtom =
    atomSelections.length > 0
      ? atomSelections[atomSelections.length - 1]
      : selectedObject?.type === 'atom'
        ? selectedObject
        : null;

  const subtitle =
    atomSelections.length > 1
      ? `${atomSelections.length} atoms`
      : selectionType === 'none'
        ? 'Click to inspect'
        : selectionType;

  return (
    <GlassPanel
      variant="strong"
      glow="violet"
      className="pointer-events-auto flex max-h-[min(32rem,60vh)] flex-col overflow-hidden"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <HudPanelHeader
        title="Inspector"
        subtitle={subtitle}
        trailing={
          selectedObject || atomSelections.length > 0 ? (
            <button
              type="button"
              onClick={clearSelection}
              className="text-[10px] tracking-wide text-aura-text-muted uppercase transition-colors hover:text-aura-cyan"
            >
              Clear
            </button>
          ) : null
        }
      />

      <div className="overflow-y-auto overscroll-contain px-3 py-2">
        {!selectedObject && atomSelections.length === 0 && (
          <p className="py-3 text-xs leading-relaxed text-aura-text-muted">
            Click atoms sequentially to measure distance (up to {MAX_ATOM_SELECTIONS}{' '}
            atoms). Click a cartoon segment for residue neighbors. Hold Shift while
            clicking a cartoon for chain selection, or a ligand atom for ligand
            selection.
          </p>
        )}

        {atomSelections.length > 0 && (
          <SectionHeading title={`Selected atoms (${atomSelections.length}/${MAX_ATOM_SELECTIONS})`} />
        )}
        {atomSelections.map((entry, index) => (
          <InfoRow
            key={`${entry.chainId}-${entry.residue.seqId}-${entry.atom.name}-${index}`}
            label={`#${index + 1}`}
            value={`${entry.residue.name}${entry.residue.seqId} ${entry.atom.name} (${entry.chainId})`}
          />
        ))}

        {distanceMeasurement && atomSelections.length >= 2 && (
          <>
            <SectionHeading title="Distance measurement" />
            <InfoRow
              label="Distance"
              value={`${distanceMeasurement.distanceAngstrom.toFixed(2)} Å`}
            />
            <InfoRow
              label="Nanometers"
              value={`${distanceMeasurement.distanceNanometer.toFixed(3)} nm`}
            />
            <InfoRow
              label="Atom A coords"
              value={formatVector(atomSelections[0].atom)}
            />
            <InfoRow
              label="Atom B coords"
              value={formatVector(atomSelections[1].atom)}
            />
            <InfoRow
              label="Midpoint"
              value={formatVector(distanceMeasurement.midpoint)}
            />
            <InfoRow
              label="Vector (A→B)"
              value={formatVector(distanceMeasurement.distanceVector)}
            />
          </>
        )}

        {activeAtom && (
          <>
            <SectionHeading title="Atom details" />
            <InfoRow label="Atom" value={activeAtom.atom.name} />
            <InfoRow label="Element" value={activeAtom.atom.element || UNAVAILABLE} />
            <InfoRow label="X" value={formatCoord(activeAtom.atom.x)} />
            <InfoRow label="Y" value={formatCoord(activeAtom.atom.y)} />
            <InfoRow label="Z" value={formatCoord(activeAtom.atom.z)} />
            <InfoRow label="Occupancy" value={UNAVAILABLE} />
            <InfoRow label="B-factor" value={UNAVAILABLE} />
            <InfoRow label="Residue" value={activeAtom.residue.name} />
            <InfoRow label="Seq #" value={activeAtom.residue.seqId} />
            <InfoRow label="Chain" value={activeAtom.chainId} />
          </>
        )}

        {selectedObject?.type === 'residue' && (
          <>
            <SectionHeading title="Residue" />
            <InfoRow label="Residue" value={selectedObject.residue.name} />
            <InfoRow label="Sequence #" value={selectedObject.residue.seqId} />
            <InfoRow label="Chain" value={selectedObject.chainId} />
            <InfoRow
              label="Secondary structure"
              value={secondaryStructureLabel(selectedObject.residue.secondaryStructure)}
            />
            <InfoRow
              label="Atom count"
              value={selectedObject.residue.atoms.length}
            />

            <SectionHeading
              title={`Neighbor residues (≤ ${DEFAULT_NEIGHBOR_RADIUS_ANGSTROM} Å)`}
            />
            {neighborResidues.length === 0 && (
              <p className="py-2 text-xs text-aura-text-muted">No neighbors in range.</p>
            )}
            {neighborResidues.slice(0, 12).map((neighbor) => (
              <InfoRow
                key={`${neighbor.chainId}-${neighbor.residue.seqId}-${neighbor.residue.name}`}
                label={`${neighbor.residue.name}${neighbor.residue.seqId}`}
                value={`${neighbor.distance.toFixed(2)} Å · chain ${neighbor.chainId}`}
              />
            ))}
            {neighborResidues.length > 12 && (
              <p className="py-1 text-[10px] text-aura-text-muted">
                +{neighborResidues.length - 12} more
              </p>
            )}
          </>
        )}

        {selectedObject?.type === 'chain' && (
          <>
            <SectionHeading title="Chain" />
            <InfoRow label="Chain ID" value={selectedObject.chain.chainId} />
            <InfoRow
              label="Residue count"
              value={selectedObject.chain.residues.length}
            />
            <InfoRow
              label="Atom count"
              value={selectedObject.chain.residues.reduce(
                (count, residue) => count + residue.atoms.length,
                0,
              )}
            />
          </>
        )}

        {selectedObject?.type === 'ligand' && (
          <>
            <SectionHeading title="Ligand" />
            <InfoRow label="Ligand" value={selectedObject.residue.name} />
            <InfoRow label="Residue ID" value={selectedObject.residue.seqId} />
            <InfoRow label="Chain" value={selectedObject.chainId} />
            <InfoRow
              label="Atom count"
              value={selectedObject.residue.atoms.length}
            />
          </>
        )}

        {(selectedObject || atomSelections.length > 0) && (
          <>
            <SectionHeading title="Interactions" />
            {hydrogenBonds.length === 0 ? (
              <p className="py-2 text-xs text-aura-text-muted">
                {hydrogenBondMessage || 'No hydrogen bonds detected.'}
              </p>
            ) : (
              hydrogenBonds.map((interaction, index) => (
                <div
                  key={`hbond-${index}-${interaction.sourceAtom.name}-${interaction.targetAtom.name}`}
                  className="border-b border-aura-border/30 py-2 last:border-0"
                >
                  {buildHydrogenBondInspectorRows(interaction).map((row) => (
                    <InfoRow key={`${interaction.type}-${row.label}`} label={row.label} value={row.value} />
                  ))}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </GlassPanel>
  );
}
