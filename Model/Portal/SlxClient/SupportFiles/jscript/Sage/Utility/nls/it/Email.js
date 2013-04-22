define(
    ({
        RecipientInfoError: "C'è stato un errore imprevisto durante il tentativo di leggere le informazioni sul destinatari: ${0}",
        MailToProtocolError: "C'è stato un errore durante il tentativo di generare un messaggio di posta elettronica utilizzando il mailto: protocollo  (href.length=${0}). Potrebbe essere necessario ridurre il numero di destinatari di posta elettronica. Errore browser: ${1}.",
        InvalidContextError: "La richiesta di e-mail non può essere elaborata. Questa operazione è supportata solo per contatti o nominativi.",
        InvalidArgumentError: "La richiesta di e-mail non può essere elaborata. Argomento non valido.",
        FilteredOutMsg: "Filtrato fuori: Non sollecitabile: ${0}; Invalido: ${1}; Dupes: ${2}",
        AllInvalidEmailError: "La collezione non include un'entità con un indirizzo di posta elettronica valido e/o sollecitabile.",
        EmailFieldQueried: "Il campo e-mail da query era: ${0}.",
        EntityInfoError: "Si è verificato un errore tentando di recuperare le informazioni relative all'entità.",
        CapabilityModeError: "La possibilità di scrivere una e-mail a una selezione di gruppo è disponibile solo in visualizzazioni elenco.",
        CapabilityEntityError: "La possibilità di scrivere una e-mail a una selezione di gruppo è disponibile solo per Contatti o Nominativi.",
        NoRowsSelectedError: "Non sono presenti righe selezionate."
    })
);