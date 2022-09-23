export interface Homework {
    onderwerp:       string;
    omschrijving:    string;
    huiswerktype:    string;
    notitie:         string;
    leerdoelen:      string;
    huiswerkUUID:    string;
    begindatum:      string;
    einddatum:       string;
    inleveropdracht: boolean;
    vaknaam:         string;
    lesgroepUUID:    string;
    externMateriaal: any[];
    heeftBijlages:   boolean;
}