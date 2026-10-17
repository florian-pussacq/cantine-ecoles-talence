## ADDED Requirements

### Requirement: Document ne précisant pas les allergènes

Un fichier de menu SHALL pouvoir déclarer, dans ses métadonnées de source, que le document dont il dérive ne précise pas les allergènes de ses plats. En l'absence de cette déclaration, le document SHALL être réputé les préciser.

L'extraction SHALL faire cette déclaration lorsque aucun plat autre que le pain ne porte de code d'allergène. La validation SHALL refuser un fichier qui fait cette déclaration tout en portant un code d'allergène sur un plat autre que le pain.

#### Scenario: Document sans allergènes hors du pain
- **WHEN** l'extraction lit un document dont seuls les pains portent un code d'allergène
- **THEN** le fichier produit déclare que le document ne précise pas les allergènes

#### Scenario: Document qui déclare ses allergènes
- **WHEN** l'extraction lit un document dont des plats autres que le pain portent des codes
- **THEN** le fichier produit ne fait aucune déclaration, et le document est réputé préciser ses allergènes

#### Scenario: Déclaration contradictoire
- **WHEN** un fichier déclare ne pas préciser les allergènes mais porte un code sur un plat principal
- **THEN** la validation échoue et la publication est refusée
