class Person {
    constructor(
        node_id = undefined,
        img = undefined,
        width = undefined,
        height = undefined,
        x = undefined,
        y = undefined,
        fio = undefined,
        birsday = undefined,
        death = undefined,
        town = undefined,
        destription = undefined,
        mother = undefined,
        father = undefined) {
            this.img = img;
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.fio = fio;
            this.birsday = birsday;
            this.death = death;
            this.town = town;
            this.destription = destription;
            this.mother = mother;
            this.father = father;
            if (node_id === undefined) {
                data.getNodeId().then(result => {
                    if (result !== undefined) {
                        this.node_id = result;
                        console.log(this);
                        data.updatePerson(this);
                    } else {
                        this.node_id = node_id;
                    }
                });
            } else {
                this.node_id = node_id;
                data.updatePerson(this);
            }
    }
}
