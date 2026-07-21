export class Inventory {

    private clues = new Set<string>();
    private items = new Set<string>();


    addClue(id:string){
        this.clues.add(id);
    }


    addItem(id:string){
        this.items.add(id);
    }


    hasClue(id:string){
        return this.clues.has(id);
    }


    hasItem(id:string){
        return this.items.has(id);
    }

}