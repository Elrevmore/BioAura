import { Line, Text } from '@react-three/drei';
import { createPortal, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { geometryAnalysisEngine } from '../analysis/GeometryAnalysisEngine';
import { useProtein } from '../hooks/useProtein';
import { useSelection } from '../hooks/useSelection';

const PROTEIN_STRUCTURE_NAME = 'protein-structure';
const MEASUREMENT_COLOR = '#22d3ee';

/**
 * Temporary distance measurement overlay — dashed line, midpoint marker, label.
 * Portaled into the protein-structure group so coordinates align with StructureModel.
 */
export function MeasurementOverlay() {
  const { scene } = useThree();
  const { status } = useProtein();
  const { atomSelections } = useSelection();

  const structureRoot =
    status === 'loaded' ? scene.getObjectByName(PROTEIN_STRUCTURE_NAME) : null;

  const measurement = useMemo(() => {
    if (atomSelections.length < 2) {
      return null;
    }
    const atomA = atomSelections[0].atom;
    const atomB = atomSelections[1].atom;
    return geometryAnalysisEngine.distance(atomA, atomB);
  }, [atomSelections]);

  if (!structureRoot || !measurement || atomSelections.length < 2) {
    return null;
  }

  const atomA = atomSelections[0].atom;
  const atomB = atomSelections[1].atom;
  const { midpoint, distanceAngstrom } = measurement;

  return createPortal(
    <group name="measurement-overlay">
      <Line
        points={[
          [atomA.x, atomA.y, atomA.z],
          [atomB.x, atomB.y, atomB.z],
        ]}
        color={MEASUREMENT_COLOR}
        lineWidth={1.5}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />
      <mesh position={[midpoint.x, midpoint.y, midpoint.z]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color={MEASUREMENT_COLOR} />
      </mesh>
      <Text
        position={[midpoint.x, midpoint.y + 0.3, midpoint.z]}
        fontSize={0.22}
        color="#e0f7fa"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.015}
        outlineColor="#0a1628"
      >
        {`${distanceAngstrom.toFixed(2)} Å`}
      </Text>
    </group>,
    structureRoot,
  );
}
