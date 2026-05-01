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
        Sprite: 'bear_sprite',
        Icon: 'bear_icon'
    },
    COW:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'cow_sprite',
        Icon: 'cow_icon'
    },
    ELEPHANT:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'elephant_sprite',
        Icon: 'elephant_icon'
    },
    FOX:{
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'fox_sprite',
        Icon: 'fox_icon'
    },
    LION:{
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: 'lion_sprite',
        Icon: 'lion_icon'
    },
    PANDA:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: 'panda_sprite',
        Icon: 'panda_icon'
    }
})