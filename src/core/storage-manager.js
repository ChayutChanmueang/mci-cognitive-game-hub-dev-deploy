export default class StorageManager{
    static save(key,value){
        try{
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key,serializedValue);
            console.log('Saved [${key}]:', value);
        }catch(error){
            console.error("Error saving to local storage:", error);
        }
    }
    static get(key, defaultValue = null){
        try{
            const serializedValue = localStorage.getItem(key);

            if(serializedValue === null){
                return defaultValue;
            }

            return JSON.parse(serializedValue);
        }
        catch(error){
            console.log("Error loading from local storage:", error);
            return defaultValue;
        }
    }
    static delete(key){
        localStorage.removeItem(key);
    }
    static clearAll(){
        localStorage.clear();
    }
}