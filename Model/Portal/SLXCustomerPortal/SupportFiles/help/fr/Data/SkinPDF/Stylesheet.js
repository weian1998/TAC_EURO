CMCXmlParser._FilePathToXmlStringMap.Add(
	'Stylesheet',
	'<?xml version=\"1.0\" encoding=\"utf-8\"?>' +
	'<Stylesheet>' +
	'    <Styles>' +
	'        <Style Name=\"Header\">' +
	'            <Properties>' +
	'                <Property Name=\"BorderTop\">solid 1px #D8DFE7</Property>' +
	'                <Property Name=\"BorderBottom\">solid 1px #323C47</Property>' +
	'                <Property Name=\"BackgroundImage\">url(\'header.png\')</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"Home Button\">' +
	'            <Properties>' +
	'                <Property Name=\"LabelWithNoneOption\">Démarrage</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"Navigation Element\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"TOC - Home Page Row\">' +
	'                    <Properties>' +
	'                        <Property Name=\"LabelWithNoneOption\">Table des Matières</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Index - Home Page Row\">' +
	'                    <Properties>' +
	'                        <Property Name=\"LabelWithNoneOption\">Index</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Glossary - Home Page Row\">' +
	'                    <Properties>' +
	'                        <Property Name=\"LabelWithNoneOption\">Glossaire</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Browse Sequence - Home Page Row\">' +
	'                    <Properties>' +
	'                        <Property Name=\"LabelWithNoneOption\">Navigation</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"About - Home Page Row\">' +
	'                    <Properties>' +
	'                        <Property Name=\"LabelWithNoneOption\">A propos de</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Index Page\">' +
	'                    <Properties>' +
	'                        <Property Name=\"SeeReference\">Voir:</Property>' +
	'                        <Property Name=\"SeeAlsoReference\">Voir également:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Search Results Page\">' +
	'                    <Properties>' +
	'                        <Property Name=\"NoResultsFoundString\">Aucun résultat trouvé.</Property>' +
	'                        <Property Name=\"SearchErrorString\">Une erreur est survenue lors de la recherche. Veuillez réessayer.</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Index Heading\">' +
	'                    <Properties>' +
	'                        <Property Name=\"BackgroundImage\">url(\'IndexHeadingBG.png\')</Property>' +
	'                        <Property Name=\"Height\">23px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Glossary Heading\">' +
	'                    <Properties>' +
	'                        <Property Name=\"BackgroundImage\">url(\'IndexHeadingBG.png\')</Property>' +
	'                        <Property Name=\"Height\">23px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"Search Bar\">' +
	'            <Properties>' +
	'                <Property Name=\"BackgroundImage\">url(\'SearchBG.png\')</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"Search Button\">' +
	'            <Properties>' +
	'                <Property Name=\"LabelWithNoneOption\">Recherche</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"Formats\">' +
	'            <Properties>' +
	'                <Property Name=\"CrossReferenceFormat\">Voir \\\"{para}\"\\</Property>' +
	'                <Property Name=\"CrossReferencePrintFormat\">Voir \\\"{para}\"\\ page {page}</Property>' +
	'                <Property Name=\"CrossReferenceBelow\">bas</Property>' +
	'                <Property Name=\"CrossReferenceAbove\">haut</Property>' +
	'                <Property Name=\"CrossReferenceOnPage\">Page</Property>' +
	'                <Property Name=\"CrossReferenceOnPreviousPage\">Page précédente</Property>' +
	'                <Property Name=\"CrossReferenceOnNextPage\">Page suivante</Property>' +
	'                <Property Name=\"CrossReferenceOnFacingPage\">Page opposée</Property>' +
	'                <Property Name=\"BreadcrumbsYouAreHereText\">Vous êtes ici : </Property>' +
	'                <Property Name=\"KeywordLinkText\">Rechercher dans l\'index</Property>' +
	'                <Property Name=\"RelatedTopicsText\">Sujets apparentés</Property>' +
	'                <Property Name=\"ConceptLinkText\">Voir aussi</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"Relationships\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"concept\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Information de Concept</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"task\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Tâches en Relation</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"reference\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Matériels de Référence</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"TocEntry\">' +
	'            <Properties>' +
	'                <Property Name=\"TopicIcon\">url(\'Topic.gif\')</Property>' +
	'                <Property Name=\"TopicIconAlternateText\">Rubrique</Property>' +
	'                <Property Name=\"BookIcon\">url(\'Book.gif\')</Property>' +
	'                <Property Name=\"BookOpenIcon\">url(\'BookOpen.gif\')</Property>' +
	'                <Property Name=\"BookIconAlternateText\">Livre</Property>' +
	'                <Property Name=\"MarkAsNewIconAlternateText\">Nouveau</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"IndexEntry\">' +
	'            <Properties>' +
	'                <Property Name=\"SeeReference\">Voir:</Property>' +
	'                <Property Name=\"SeeAlsoReference\">Voir également:</Property>' +
	'            </Properties>' +
	'        </Style>' +
	'        <Style Name=\"AccordionItem\">' +
	'            <Properties>' +
	'                <Property Name=\"ItemHeight\">28px</Property>' +
	'            </Properties>' +
	'            <Classes>' +
	'                <StyleClass Name=\"IconTray\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'AccordionIconsBackground.jpg\')</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"TOC\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Table des Matières</Property>' +
	'                        <Property Name=\"Icon\">url(\'TocIcon.gif\')</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'TocAccordionBackground.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImageHover\">url(\'TocAccordionBackground_over.jpg\')</Property>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Index\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Index</Property>' +
	'                        <Property Name=\"Icon\">url(\'IndexIcon.gif\')</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'IndexAccordionBackground.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImageHover\">url(\'IndexAccordionBackground_over.jpg\')</Property>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Favorites\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Favoris</Property>' +
	'                        <Property Name=\"Icon\">url(\'FavoritesIcon.gif\')</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'FavoritesAccordionBackground.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImageHover\">url(\'FavoritesAccordionBackground_over.jpg\')</Property>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Glossary\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Glossaire</Property>' +
	'                        <Property Name=\"Icon\">url(\'GlossaryIcon.gif\')</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'GlossaryAccordionBackground.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImageHover\">url(\'GlossaryAccordionBackground_over.jpg\')</Property>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"BrowseSequence\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Navigation</Property>' +
	'                        <Property Name=\"Icon\">url(\'BrowsesequencesIcon.gif\')</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'BrowsesequencesAccordionBackground.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImageHover\">url(\'BrowsesequencesAccordionBackground_over.jpg\')</Property>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Search\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Recherche</Property>' +
	'                        <Property Name=\"Icon\">url(\'SearchIcon.gif\')</Property>' +
	'                        <Property Name=\"BackgroundImage\">url(\'SearchAccordionBackground.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImageHover\">url(\'SearchAccordionBackground_over.jpg\')</Property>' +
	'                        <Property Name=\"ItemHeight\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"ToolbarItem\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"AccordionTitle\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">AccordionTitle</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"QuickSearch\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'QuickSearch.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'QuickSearch_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'QuickSearch_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Recherche rapide</Property>' +
	'                        <Property Name=\"SearchBoxTooltip\">Champ d\'entrée recherche rapide</Property>' +
	'                        <Property Name=\"ControlType\">QuickSearch</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Logo\">' +
	'                    <Properties>' +
	'                        <Property Name=\"LogoAlternateText\">Logo</Property>' +
	'                        <Property Name=\"AboutBoxAlternateText\">A propos de</Property>' +
	'                        <Property Name=\"Icon\">url(\'LogoIcon.gif\')</Property>' +
	'                        <Property Name=\"ControlType\">Logo</Property>' +
	'                        <Property Name=\"Tooltip\">Logo</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"ExpandAll\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">ExpandAll</Property>' +
	'                        <Property Name=\"Icon\">url(\'Expand.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Expand_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Expand_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Afficher tout</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CollapseAll\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">CollapseAll</Property>' +
	'                        <Property Name=\"Icon\">url(\'Collapse.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Collapse_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Collapse_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Masquer tout</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"RemoveHighlight\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">RemoveHighlight</Property>' +
	'                        <Property Name=\"Icon\">url(\'Highlight.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Highlight_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Highlight_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Supprimer mise en surbrillance </Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Print\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">Print</Property>' +
	'                        <Property Name=\"Icon\">url(\'Print.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Print_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Print_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Imprimer rubrique</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"ToggleNavigationPane\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'HideNavigation.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'HideNavigation_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'HideNavigation_over.gif\')</Property>' +
	'                        <Property Name=\"CheckedIcon\">url(\'HideNavigation_checked.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Masquer navigation</Property>' +
	'                        <Property Name=\"ShowTooltip\">Afficher navigation</Property>' +
	'                        <Property Name=\"ControlType\">ToggleNavigationPane</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Back\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">Back</Property>' +
	'                        <Property Name=\"Icon\">url(\'Back.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Back_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Back_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Retour</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Forward\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">Forward</Property>' +
	'                        <Property Name=\"Icon\">url(\'Forward.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Forward_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Forward_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">En avant</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Home\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">Home</Property>' +
	'                        <Property Name=\"Icon\">url(\'Home.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Home_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Home_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Démarrage</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Stop\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">Stop</Property>' +
	'                        <Property Name=\"Icon\">url(\'Stop.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Stop_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Stop_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Arrêter</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Refresh\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">Refresh</Property>' +
	'                        <Property Name=\"Icon\">url(\'Refresh.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Refresh_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Refresh_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Actualiser</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SelectTOC\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">SelectTOC</Property>' +
	'                        <Property Name=\"Icon\">url(\'SelectToc.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'SelectToc_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'SelectToc_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Table des Matières</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SelectIndex\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">SelectIndex</Property>' +
	'                        <Property Name=\"Icon\">url(\'SelectIndex.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'SelectIndex_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'SelectIndex_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Index</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SelectSearch\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">SelectSearch</Property>' +
	'                        <Property Name=\"Icon\">url(\'SelectSearch.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'SelectSearch_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'SelectSearch_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Recherche</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SelectFavorites\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">SelectFavorites</Property>' +
	'                        <Property Name=\"Icon\">url(\'SelectFavorites.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'SelectFavorites_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'SelectFavorites_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Favoris</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SelectGlossary\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">SelectGlossary</Property>' +
	'                        <Property Name=\"Icon\">url(\'SelectGlossary.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'SelectGlossary_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'SelectGlossary_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Glossaire</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SelectBrowseSequence\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">SelectBrowseSequence</Property>' +
	'                        <Property Name=\"Icon\">url(\'SelectBrowseSequences.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'SelectBrowseSequences_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'SelectBrowseSequences_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Navigation</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"AddTopicToFavorites\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">AddTopicToFavorites</Property>' +
	'                        <Property Name=\"Icon\">url(\'AddTopicToFavorites.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'AddTopicToFavorites_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'AddTopicToFavorites_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Ajouter rubrique aux favoris</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"TopicRatings\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Tooltip\">Évaluation de sujet</Property>' +
	'                        <Property Name=\"EmptyIcon\">url(\'Rating0.gif\')</Property>' +
	'                        <Property Name=\"FullIcon\">url(\'RatingGold100.gif\')</Property>' +
	'                        <Property Name=\"RatingSubmittedMessage\">Thank you for submitting your rating!</Property>' +
	'                        <Property Name=\"ControlType\">TopicRatings</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"EditUserProfile\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">EditUserProfile</Property>' +
	'                        <Property Name=\"Icon\">url(\'EditUserProfile.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'EditUserProfile_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'EditUserProfile_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Modifier votre profil utilisateur</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"PreviousTopic\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">PreviousTopic</Property>' +
	'                        <Property Name=\"Icon\">url(\'PreviousTopic.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'PreviousTopic_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'PreviousTopic_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Sujet Précédent</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"NextTopic\">' +
	'                    <Properties>' +
	'                        <Property Name=\"ControlType\">NextTopic</Property>' +
	'                        <Property Name=\"Icon\">url(\'NextTopic.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'NextTopic_over.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'NextTopic_selected.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Sujet Suivant</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CurrentTopicIndex\">' +
	'                    <Properties>' +
	'                        <Property Name=\"PaddingLeft\">2px</Property>' +
	'                        <Property Name=\"PaddingRight\">2px</Property>' +
	'                        <Property Name=\"Label\">Page {n} de {total}</Property>' +
	'                        <Property Name=\"ControlType\">CurrentTopicIndex</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Separator\">' +
	'                    <Properties>' +
	'                        <Property Name=\"SeparatorAlternateText\">Séparateur</Property>' +
	'                        <Property Name=\"ControlType\">Separator</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"FeedbackUserProfileItem\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"Username\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Nom d\'utilisateur:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"EmailAddress\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Adresse Email:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"FirstName\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Prénom:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"MiddleName\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Deuxième prénom:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"LastName\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Nom de famille:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Address1\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Adresse:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Address2\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Adresse 2:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Address3\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Adresse 3:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Address4\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Adresse 4:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"City\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Ville:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"State\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Etat fédéral:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"PostalCode\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Code postal:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Country\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Pays:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Gender\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Sexe:</Property>' +
	'                        <Property Name=\"GenderFemaleName\">F</Property>' +
	'                        <Property Name=\"GenderMaleName\">M</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Phone1\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Téléphone:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Phone2\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Téléphone 2:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Phone3\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Téléphone 3:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Fax\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Télécopie:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Birthdate\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Date de naissance:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Date\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Date:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Employer\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Employeur:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Occupation\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Profession:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Department\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Service:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom1\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom2\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 2:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom3\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 3:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom4\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 4:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom5\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 5:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom6\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 6:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom7\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 7:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom8\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 8:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom9\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 9:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Custom10\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Personnalisé 10:</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"Frame\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"Toolbar\">' +
	'                    <Properties>' +
	'                        <Property Name=\"BackgroundImage\">url(\'ToolbarBackground.jpg\')</Property>' +
	'                        <Property Name=\"Height\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"TopicToolbar\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Height\">28px</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"NavigationTopDivider\">' +
	'                    <Properties>' +
	'                        <Property Name=\"BackgroundImage\">url(\'NavigationTopGradient.jpg\')</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"NavigationDragHandle\">' +
	'                    <Properties>' +
	'                        <Property Name=\"BackgroundImage\">url(\'NavigationBottomGradient.jpg\')</Property>' +
	'                        <Property Name=\"BackgroundImagePressed\">url(\'NavigationBottomGradient_selected.jpg\')</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"BodyComments\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Commentaires</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"Control\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"SearchButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Rechercher</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SearchBox\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Tooltip\">Champ d\'entrée recherche</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SearchFiltersLabel\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Filtre</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SearchUnfilteredLabel\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">(non filtré)</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SearchFavoritesLabel\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Recherches favorites</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"TopicFavoritesLabel\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Rubriques favorites</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SearchFavoritesDeleteButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'Delete.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Delete_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Delete_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Supprimer les favoris sélectionnés</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"TopicFavoritesDeleteButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'Delete.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'Delete_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'Delete_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Supprimer les rubriques sélectionnées</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"EmptySearchFavoritesLabel\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">(pas de recherche par défaut)</Property>' +
	'                        <Property Name=\"Tooltip\">(pas de recherche par défaut)</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"EmptyTopicFavoritesLabel\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">(pas de rubrique par défaut)</Property>' +
	'                        <Property Name=\"Tooltip\">(pas de rubrique par défaut)</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"AddSearchToFavoritesButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'AddSearchToFavorites.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'AddSearchToFavorites_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'AddSearchToFavorites_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Ajouter recherche aux favoris</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"IndexSearchBox\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Tooltip\">Champ d\'entrée mots clés</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"SearchResults\">' +
	'                    <Properties>' +
	'                        <Property Name=\"TableSummary\">This table contains the results of the search that was performed. The first column indicates the search rank and the second column indicates the title of the topic that contains the search result.</Property>' +
	'                        <Property Name=\"RankLabel\">Rang</Property>' +
	'                        <Property Name=\"TitleLabel\">Titre</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"Messages\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Loading\">RECHERCHE EN COURS</Property>' +
	'                        <Property Name=\"LoadingAlternateText\">Recherche en cours</Property>' +
	'                        <Property Name=\"NoTopicsFound\">Rubriques introuvables</Property>' +
	'                        <Property Name=\"InvalidToken\">Jeton non valide</Property>' +
	'                        <Property Name=\"QuickSearchExternal\">Recherche de thèmes externes impossible</Property>' +
	'                        <Property Name=\"QuickSearchIE5.5\">Internet Explorer 5.5 ne permet pas d\'effectuer une recherche par thème</Property>' +
	'                        <Property Name=\"RemoveHighlightIE5.5\">Internet Explorer 5.5 ne permet pas de supprimer la mise en surbrillance des termes de recherche</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CommentsAddButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'AddComment.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'AddComment_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'AddComment_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Ajouter commentaire</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CommentsReplyButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'ReplyComment.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'ReplyComment_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'ReplyComment_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Répondre au commentaire</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CommentsRefreshButton\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'RefreshTopicComments.gif\')</Property>' +
	'                        <Property Name=\"PressedIcon\">url(\'RefreshTopicComments_selected.gif\')</Property>' +
	'                        <Property Name=\"HoverIcon\">url(\'RefreshTopicComments_over.gif\')</Property>' +
	'                        <Property Name=\"Tooltip\">Refraîchir</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CommentNode\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'Comment.gif\')</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"CommentReplyNode\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Icon\">url(\'CommentReply.gif\')</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"NavigationLinkTop\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Ouvert de navigation</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"NavigationLinkBottom\">' +
	'                    <Properties>' +
	'                        <Property Name=\"Label\">Ouvert de navigation</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'        <Style Name=\"Dialog\">' +
	'            <Classes>' +
	'                <StyleClass Name=\"AddComment\">' +
	'                    <Properties>' +
	'                        <Property Name=\"SubmitButtonLabel\">Soumettre</Property>' +
	'                        <Property Name=\"CancelButtonLabel\">Annuler</Property>' +
	'                        <Property Name=\"TitleLabel\">Ajouter commentaire:</Property>' +
	'                        <Property Name=\"UserNameLabel\">Nom d\'utilisateur:</Property>' +
	'                        <Property Name=\"SubjectLabel\">Sujet:</Property>' +
	'                        <Property Name=\"CommentLabel\">Commentaire: </Property>' +
	'                        <Property Name=\"CommentLengthExceeded\">La longueur maximum pour les commentaires a été dépassée de {n} caractères.</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"ReplyComment\">' +
	'                    <Properties>' +
	'                        <Property Name=\"SubmitButtonLabel\">Soumettre</Property>' +
	'                        <Property Name=\"CancelButtonLabel\">Annuler</Property>' +
	'                        <Property Name=\"TitleLabel\">Répondre au commentaire:</Property>' +
	'                        <Property Name=\"UserNameLabel\">Nom d\'utilisateur:</Property>' +
	'                        <Property Name=\"SubjectLabel\">Sujet:</Property>' +
	'                        <Property Name=\"CommentLabel\">Commentaire: </Property>' +
	'                        <Property Name=\"OriginalCommentLabel\">Commentaire originel:</Property>' +
	'                        <Property Name=\"CommentLengthExceeded\">La longueur maximum pour les commentaires a été dépassée de {n} caractères.</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'                <StyleClass Name=\"RegisterUser\">' +
	'                    <Properties>' +
	'                        <Property Name=\"SubmitButtonLabel\">Soumetrre</Property>' +
	'                        <Property Name=\"CancelButtonLabel\">Annuler</Property>' +
	'                        <Property Name=\"TitleLabel\">Créer un profil de service des commentaires:</Property>' +
	'                        <Property Name=\"EditProfileTitleLabel\">Edier le profil du service pour le feedback :</Property>' +
	'                        <Property Name=\"UserNameLabel\">Nom d\'utilisateur:</Property>' +
	'                        <Property Name=\"EmailAddressLabel\">Adresse Email:</Property>' +
	'                        <Property Name=\"FirstNameLabel\">Prénom:</Property>' +
	'                        <Property Name=\"LastNameLabel\">Nom de famille:</Property>' +
	'                        <Property Name=\"CountryLabel\">Pays:</Property>' +
	'                        <Property Name=\"PostalCodeLabel\">Code postal:</Property>' +
	'                        <Property Name=\"GenderLabel\">Genre:</Property>' +
	'                        <Property Name=\"GenderFemaleName\">F</Property>' +
	'                        <Property Name=\"GenderMaleName\">M</Property>' +
	'                        <Property Name=\"Registration\">Vous devez créer un profil d\'utilisateur à publier commentaires à cet système d\'aide. S\'il vous plaît, saisissez l\'information au-dessous. Un email sera envoyé à l\'adresse que vous fournissez. S\'il vous plaît, suivez les instructions dans l\'email pour complèter l\'activation.</Property>' +
	'                        <Property Name=\"EditProfileRegistration\">Utilisez ce formulaire pour actualiser votre profil utilisateur. Si vous modifiez votre adresse électronique, un message sera envoyé à cette adresse. Veuillez suivre les indications indiquées dans ce message pour terminer la procédure d\'activation.</Property>' +
	'                        <Property Name=\"RegistrationSubmit\">Votre information a été envoyé à MadCap Software.Lorsque l\'information est traité, vous recevrez un email avec un lien à une page de vérification. Cliquez sur ce lien, ou copiez et collez le lien dans votre navigateur web afin de complèter l\'inscription.</Property>' +
	'                        <Property Name=\"RegistrationSubmitNote\">Quelques fournisseurs de service ont les filtres d\'email qui peut causer l\'email de notification d\'être envoyé à votre dossier de spam. Si vous ne recevez pas un email de notification, s\'il vous plaît, regarder dans ce dossier.</Property>' +
	'                        <Property Name=\"MissingRequiredField\">Veuillez entrer une valeur pour :</Property>' +
	'                        <Property Name=\"UpdateSuccess\">Votre profil utilisateur a été actualisé !</Property>' +
	'                        <Property Name=\"EmailNotificationsGroupLabel\">Notifications de messages</Property>' +
	'                        <Property Name=\"EmailNotificationsHeadingLabel\">Je souhaite recevoir un message lorsque</Property>' +
	'                        <Property Name=\"CommentReplyNotificationLabel\">un de mes commentaires a reçu une réponse</Property>' +
	'                        <Property Name=\"CommentSameTopicNotificationLabel\">un des sujets que j\'ai commentés a été commenté</Property>' +
	'                        <Property Name=\"CommentSameHelpSystemNotificationLabel\">un sujet dans le système d\'aide a été commenté</Property>' +
	'                    </Properties>' +
	'                </StyleClass>' +
	'            </Classes>' +
	'        </Style>' +
	'    </Styles>' +
	'    <ResourcesInfo>' +
	'        <Resource Name=\"QuickSearch.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"QuickSearch_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"QuickSearch_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"LogoIcon.gif\" Width=\"111\" Height=\"24\" />' +
	'        <Resource Name=\"Expand.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Expand_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Expand_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Collapse.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Collapse_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Collapse_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Highlight.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Highlight_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Highlight_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Print.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Print_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Print_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"HideNavigation.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"HideNavigation_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"HideNavigation_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"HideNavigation_checked.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Back.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Back_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Back_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Forward.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Forward_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Forward_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Home.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Home_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Home_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Stop.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Stop_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Stop_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Refresh.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Refresh_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Refresh_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectToc.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectToc_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectToc_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectIndex.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectIndex_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectIndex_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectSearch.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectSearch_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectSearch_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectFavorites.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectFavorites_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectFavorites_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectGlossary.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectGlossary_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectGlossary_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectBrowseSequences.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectBrowseSequences_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"SelectBrowseSequences_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddTopicToFavorites.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddTopicToFavorites_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddTopicToFavorites_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Rating0.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"RatingGold100.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"EditUserProfile.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"EditUserProfile_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"EditUserProfile_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"PreviousTopic.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"PreviousTopic_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"PreviousTopic_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"NextTopic.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"NextTopic_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"NextTopic_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"TocIcon.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"TocAccordionBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"TocAccordionBackground_over.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"IndexIcon.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"IndexAccordionBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"IndexAccordionBackground_over.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"SearchIcon.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"SearchAccordionBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"SearchAccordionBackground_over.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"FavoritesIcon.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"FavoritesAccordionBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"FavoritesAccordionBackground_over.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"BrowsesequencesIcon.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"BrowsesequencesAccordionBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"BrowsesequencesAccordionBackground_over.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"GlossaryIcon.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"GlossaryAccordionBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"GlossaryAccordionBackground_over.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"AccordionIconsBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"header.png\" Width=\"1\" Height=\"42\" />' +
	'        <Resource Name=\"IndexHeadingBG.png\" Width=\"1\" Height=\"23\" />' +
	'        <Resource Name=\"SearchBG.png\" Width=\"1\" Height=\"43\" />' +
	'        <Resource Name=\"Topic.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"Book.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"BookOpen.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"ToolbarBackground.jpg\" Width=\"2\" Height=\"28\" />' +
	'        <Resource Name=\"NavigationTopGradient.jpg\" Width=\"2\" Height=\"8\" />' +
	'        <Resource Name=\"NavigationBottomGradient.jpg\" Width=\"2\" Height=\"7\" />' +
	'        <Resource Name=\"NavigationBottomGradient_selected.jpg\" Width=\"2\" Height=\"7\" />' +
	'        <Resource Name=\"Delete.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Delete_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Delete_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddSearchToFavorites.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddSearchToFavorites_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddSearchToFavorites_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddComment.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddComment_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"AddComment_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"ReplyComment.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"ReplyComment_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"ReplyComment_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"RefreshTopicComments.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"RefreshTopicComments_selected.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"RefreshTopicComments_over.gif\" Width=\"23\" Height=\"22\" />' +
	'        <Resource Name=\"Comment.gif\" Width=\"16\" Height=\"16\" />' +
	'        <Resource Name=\"CommentReply.gif\" Width=\"16\" Height=\"16\" />' +
	'    </ResourcesInfo>' +
	'</Stylesheet>'
);
