import { CardType, EnergyType } from '../../game/store/card/card-types';
import { EnergyCard } from '../../game/store/card/energy-card';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import { EnergyEffect } from '../../game/store/effects/play-card-effects';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';

export class BlendEnergyGRPD extends EnergyCard {

  public provides: CardType[] = [CardType.COLORLESS];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'DRX';

  public cardImage: string = 'assets/cardback.png';

  public setNumber: string = '117';

  public name = 'Blend Energy GRPD';

  public fullName = 'Blend Energy GRPD DRX';

  public text = 'This card provides [C] Energy. When this card is attached to a Pokémon, this card provides [G], [R], [P], or [D] Energy but provides only 1 Energy at a time.';

  blendedEnergies = [CardType.GRASS, CardType.FIRE, CardType.PSYCHIC, CardType.DARK];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.cards.includes(this)) {
      const player = effect.player;
      const pokemon = effect.source;

      try {
        const energyEffect = new EnergyEffect(player, this);
        store.reduceEffect(state, energyEffect);
      } catch {
        return state;
      }

      const pokemonCard = pokemon.getPokemonCard();
      const attackCosts = pokemonCard?.attacks.map(attack => attack.cost);

      const costs = attackCosts?.flat().filter(t => t !== CardType.COLORLESS) || [];
      const alreadyProvided = effect.energyMap.flatMap(e => e.provides);
      const neededType = costs.find(cost =>
        this.blendedEnergies.includes(cost) &&
        !alreadyProvided.includes(cost)
      );

      effect.energyMap.push({
        card: this,
        provides: neededType ? [neededType] : [CardType.COLORLESS]
      });
    }
    return state;
  }
}