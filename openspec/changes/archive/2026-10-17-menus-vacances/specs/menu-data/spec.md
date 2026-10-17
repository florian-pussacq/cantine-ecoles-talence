## ADDED Requirements

### Requirement: Menus de vacances

Le système SHALL publier les menus de vacances de la Ville comme des fichiers de menu datés, conformes au même schéma que les mensuels, portant l'intitulé du document dont ils dérivent.

Le manifeste SHALL les inscrire avec une nature propre et le nom de leur fichier. Lorsqu'un menu de vacances et un mensuel couvrent une même date, la version du menu de vacances SHALL être retenue.

#### Scenario: Deux documents pour un même mois
- **WHEN** octobre 2026 a un mensuel et un menu de vacances
- **THEN** le manifeste inscrit les deux, chacun avec son fichier, et les jours de chacun sont disponibles

#### Scenario: Menu de vacances à cheval sur deux mois
- **WHEN** le menu de Noël couvre du 21 décembre au 1er janvier
- **THEN** il est publié en un seul fichier, et ses jours de janvier sont disponibles comme ceux de décembre

#### Scenario: Version antérieure de l'application
- **WHEN** une version qui ne connaît pas les menus de vacances lit le manifeste
- **THEN** elle les ignore et affiche les mensuels comme auparavant
