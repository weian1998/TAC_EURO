define(
    ({
        RecipientInfoError: "Une erreur inattendue est survenue lors de la tentative de lecture des informations du destinataire : ${0}",
        MailToProtocolError: "Une erreur est survenue lors de la tentative de génération de l'e-mail à l'aide du mailto: protocol (href.length=${0}). Il faut peut-être réduire le nombre de destinataires de l'email. Erreur du navigateur : ${1}.",
        InvalidContextError: "La demande d'e-mail ne peut pas être traitée. Cette opération n'est prise en charge que pour les contacts ou les leads.",
        InvalidArgumentError: "La demande d'e-mail ne peut pas être traitée. Argument invalide.",
        FilteredOutMsg: "Tri : Non-sollicitables : ${0}; Non-valides : ${1}; Doublons : ${2}",
        AllInvalidEmailError: "La collection n'inclut pas d'entités avec une adresse e-mail valide ou sollicitable.",
        EmailFieldQueried: "Le champ e-mail interrogé était : ${0}.",
        EntityInfoError: "Echec lors de la tentative de récupération des informations de l'entité.",
        CapabilityModeError: "La capacité d'écrire un e-mail à une sélection de groupes n'est disponible que dans la vue Listes.",
        CapabilityEntityError: "La capacité d'écrire un e-mail à une sélection de groupes n'est disponible que pour les contacts ou les leads.",
        NoRowsSelectedError: "Aucune ligne n'est sélectionnée."
    })
);