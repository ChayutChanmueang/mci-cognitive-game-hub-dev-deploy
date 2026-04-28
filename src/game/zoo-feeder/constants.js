export const FoodTypes = Object.freeze({
    VEGETABLE: 'Vegetable',
    MEAT: 'Meat',
    JUNK: 'Junk'
});
export const FoodSpriteLibrary = {
    [FoodTypes.VEGETABLE]: ['apple_sprite','corn_sprite','plant_sprite'],
    [FoodTypes.MEAT]: ['beef_sprite','chicken_sprite','fish_sprite'],
    [FoodTypes.JUNK]: ['battery_sprite','garbage_sprite','soda_sprite']
}
export const AnimalSetting = Object.freeze({
    BEAR:{
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'bear_sprite'
    },
    COW:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'cow_sprite'
    },
    ELEPHANT:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'elephant_sprite'
    },
    FOX:{
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'fox_sprite'
    },
    LION:{
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'lion_sprite'
    },
    PANDA:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'panda_sprite'
    }
})