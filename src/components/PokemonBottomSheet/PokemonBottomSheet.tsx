import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { COLORS } from '../../constants/theme';

import { PokemonDetail } from '../PokemonDetail';
import type { Pokemon } from '../../types/pokemon';

type Props = {
  pokemon: Pokemon | null;
  onClose: () => void;
};

export function PokemonBottomSheet({ pokemon, onClose }: Props) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo<string[]>(() => ['100%'], []);

  useEffect(() => {
    if (pokemon !== null) {
      ref.current?.snapToIndex(0);
    } else {
      ref.current?.close();
    }
  }, [pokemon]);

  const handleChange = useCallback(
    (index: number): void => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleChange}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.content}>
        {pokemon !== null ? (
          <PokemonDetail pokemon={pokemon} actionButton={null} />
        ) : (
          <></>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.white,
  },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.divider,
  },
  content: {
    flex: 1,
  },
});
