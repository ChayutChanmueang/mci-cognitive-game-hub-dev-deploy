export const FoodTypes = Object.freeze({
    VEGETABLE: 'Vegetable',
    MEAT: 'Meat',
    JUNK: 'Junk'
});
export const FoodSpriteLibrary = {
    [FoodTypes.VEGETABLE]: ['🍎','🍊','🥬'],
    [FoodTypes.MEAT]: ['🐟','🍖','🥩'],
    [FoodTypes.JUNK]: ['🥫','🧦','💡']
}
export const AnimalSetting = Object.freeze({
    LION:{
        AcceptableFoodType: FoodTypes.MEAT,
        Sprite: '🦁'
    },
    COW:{
        AcceptableFoodType: FoodTypes.VEGETABLE,
        Sprite: '🐮'
    }
})