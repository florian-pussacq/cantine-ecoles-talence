## ADDED Requirements

### Requirement: Aucun menu d'un autre jour à la première peinture

Lorsque la page reçue a été rendue pour un jour civil de Paris différent de celui du navigateur, le système NE SHALL PAS peindre le contenu qui dépend du jour — écran du jour, écran de la semaine — avant que l'application ait résolu le jour courant. La place de ce contenu SHALL être conservée, et les éléments qui ne dépendent pas du jour SHALL rester peints.

Si l'application ne parvient pas à résoudre le jour courant dans un délai de trois secondes, le contenu pré-rendu SHALL être montré.

#### Scenario: Page rendue pour le jour courant
- **WHEN** la page a été rendue pour le jour civil de Paris du navigateur
- **THEN** elle se peint entière dès l'arrivée du HTML

#### Scenario: Page rendue un autre jour
- **WHEN** la page a été rendue pour un autre jour que celui du navigateur
- **THEN** l'enseigne et les onglets sont peints, la zone du jour est masquée en gardant sa place, puis elle apparaît avec le menu du jour courant une fois l'application prête

#### Scenario: Application qui ne démarre pas
- **WHEN** la page est périmée et que l'application ne démarre pas
- **THEN** la zone du jour apparaît au bout de trois secondes avec le contenu pré-rendu
