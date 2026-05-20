export default class SessionStorageManager{
    static save(key,value){
        try{
            const serializedValue = JSON.stringify(value);
            sessionStorage.setItem(key,serializedValue);
            console.log('Saved [${key}]:', value);
        }catch(error){
            console.error("Error saving to session storage:", error);
        }
    }
    static get(key, defaultValue = null){
        try{
            const serializedValue = sessionStorage.getItem(key);

            if(serializedValue === null){
                return defaultValue;
            }

            return JSON.parse(serializedValue);
        }
        catch(error){
            console.log("Error loading from session storage:", error);
            return defaultValue;
        }
    }
    static delete(key){
        sessionStorage.removeItem(key);
    }
    static clearAll(){
        sessionStorage.clear();
    }
}
