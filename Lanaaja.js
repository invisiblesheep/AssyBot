class Lanaaja {
        constructor(name, esh) {

                    this.name = name;
                    this.sleep = 100.0;
                    this.es  = 0;
                    this.esh = esh;
                    this.food = 100.0;
                    this.massy = 0;
                    this.massyh = 10.0;
                    this.vitutus1 = 0.0;
                    this.vitutus2 = 0.0;
                    this.filth = 0.0;

                    this.foodWarningFlagLow = false;
                    this.foodWarningFlagMed = false;
                    this.foodWarningFlagHigh = false;

                    this.sleepWarningFlagLow = false;
                    this.sleepWarningFlagMed = false;
                    this.sleepWarningFlagHigh = false;

                    this.filthWarningFlagLow = false;
                    this.filthWarningFlagMed = false;
                    this.filthWarningFlagHigh = false;
                }

        get(attribute) {

                }
}

module.exports.Lanaaja = Lanaaja;
