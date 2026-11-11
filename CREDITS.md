# Credits — Simplified MRI

A SceneryStack reimplementation of **Simplified MRI**, a Java simulation by the
[PhET Interactive Simulations](https://phet.colorado.edu/) project at the University of Colorado
Boulder (version 1.08, 2011; [PhET page](https://phet.colorado.edu/en/simulations/mri)).
This is an independent OpenLyceum project, not an official PhET product, and is not endorsed by
PhET or the University of Colorado.

## Original simulation

- Software development: Ron LeMaster
- Design team: Michael Dubson, Sam McKagan, Kathy Perkins, Carl Wieman
- Interviews: Danielle Harlow

The port was written from the Java source in PhET's legacy SVN repository (`trunk`
`simulations-java/simulations/mri`, revision 75234), pinned for reference in
[`OpenLyceum/Baseline`](https://github.com/OpenLyceum/Baseline) as `PhET/mri`. No PhET
artwork is used: the head, coils, nuclei and detector are redrawn as vectors. The Relaxation
screen and the physics changes listed in [`doc/model.md`](doc/model.md) are new.

## Data

Gyromagnetic ratios are standard isotope values. Tissue T1 and T2 at 1.5 T are typical values
after Stanisz et al., *Magn. Reson. Med.* 54, 507 (2005), and Bojorquez et al., *Magn. Reson.
Imaging* 35, 69 (2017).

## License

GNU Affero General Public License v3.0 or later — see [org LICENSE](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Acknowledgments

Built with [SceneryStack](https://scenerystack.org/) as part of the
[OpenLyceum](https://github.com/OpenLyceum) fleet. The chart frame and control helpers are
adapted from the fleet's PhotonInteractions simulation.
