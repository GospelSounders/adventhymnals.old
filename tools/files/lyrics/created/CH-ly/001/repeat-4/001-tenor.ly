\header
    {
      tagline = ""  % removed
      title = "1. Before Jehovah's Awful Throne "
      composer = " John Hatton (d. 1793) "
      poet = " Isaac Watts (1674-1748) "
      subtitle = "L.M"
    }
    
    \version "2.18.2"
    %
    %% global for all staves
    %
global = { \key d \major \time 4/4 \tempo 4 = 109  }
%Individual voices

soprano = {d'2 fis'4 g'4 a'2 b'4 (cis''4) d''2 cis''4 (b'4) a'1 a'2 a'4 a'4 b'2 a'2 g'2 fis'2 e'1 fis'2 fis'4 e'4 d'4 (fis'4) a'4 (d''4) b'4 (a'4) g'4 (fis'4) e'1 a'2 b'4 cis''4 d''2. g'4 fis'2 e'2 d'1 }
alto = {d'2 d'4 cis'4 d'2 d'4 (e'4) fis'2 e'4 (d'4) cis'1 d'2 d'4 d'4 d'2 d'4 (a4) b4 (cis'4) d'2 cis'1 d'2 d'4 a4 a4 (d'4) d'2 d'2 cis'4 (d'4) cis'1 d'2 d'4 e'4 fis'4. (e'8 d'4) e'4 d'2 cis'2 d'1 }
tenor = {fis2 a4 a4 a2 g2 fis4 (a4) a4 (gis4) a1 fis2 fis4 a4 g2 a4 (fis4) g2 a2 a1 a2 a4 g4 fis4 (a4) a2 b4 (d'4) a2 a1 a2 g4 g4 fis4. (g8 a4) b4 a2 a4 (g4) fis1 }
bass = {d2 d4 e4 fis2 \override NoteColumn.force-hshift = 10 g4 (e4) d2 e2 a,1 d2 d4 fis4 g2 fis2 e2 d2 a,1 d2 d4 cis4 d2 fis2 g4 (fis4) e4 (d4) a,1 fis2 g4 e4 d4. (e8 fis4) g4 a2 a,2 d1 }
%lyrics
stanzaa =  \lyricmode { \set stanza = #"1. "Be- fore Je- ho- vah's aw- ful throne, Ye na- tions, bow with sa- cred joy; Know that the Lord is God a- lone; He can cre- ate, and He de- stroy. }
stanzab =  \lyricmode { \set stanza = #"2. "His sov- ereign power, with- out our aid, Made us of clay, and formed us men; And when like wan- ndering sheep we strayed, He brought us to His fold a- gain. }
stanzac =  \lyricmode { \set stanza = #"3. "We'll crowd His gates with thank- ful songs, High as the heavens our voi- ces raise; And earth, with her ten thou- sand tongues, Shall fill His courts with sound- ing praise. }
stanzad =  \lyricmode { \set stanza = #"4. "Wide as the world is His com- mand, Vast as E- ter- ni- ty His love; Firm as anaa rock His truth shall stand, When ro- lling years shall cease to move. }
\score {
      \new ChoirStaff <<
       \new Staff <<
\clef "treble"
      

      \new Lyrics \lyricsto "Tenor" { \stanzaa }
\new Lyrics \lyricsto "Tenor" { \stanzab }
\new Lyrics \lyricsto "Tenor" { \stanzac }
\new Lyrics \lyricsto "Tenor" { \stanzad }

>>
        \new Staff <<
\clef "bass"
        \new Voice = "Tenor" { \voiceOne \global \tenor}

        \new Lyrics \lyricsto "Tenor" { \stanzaa }
\new Lyrics \lyricsto "Tenor" { \stanzab }
\new Lyrics \lyricsto "Tenor" { \stanzac }
\new Lyrics \lyricsto "Tenor" { \stanzad }

>>\new Staff <<
\clef "bass"
        \new Voice = "Tenor" { \voiceOne \global \tenor}

        \new Lyrics \lyricsto "Tenor" { \stanzaa }
\new Lyrics \lyricsto "Tenor" { \stanzab }
\new Lyrics \lyricsto "Tenor" { \stanzac }
\new Lyrics \lyricsto "Tenor" { \stanzad }

>>\new Staff <<
\clef "bass"
        \new Voice = "Tenor" { \voiceOne \global \tenor}

        \new Lyrics \lyricsto "Tenor" { \stanzaa }
\new Lyrics \lyricsto "Tenor" { \stanzab }
\new Lyrics \lyricsto "Tenor" { \stanzac }
\new Lyrics \lyricsto "Tenor" { \stanzad }

>>\new Staff <<
\clef "bass"
        \new Voice = "Tenor" { \voiceOne \global \tenor}

        \new Lyrics \lyricsto "Tenor" { \stanzaa }
\new Lyrics \lyricsto "Tenor" { \stanzab }
\new Lyrics \lyricsto "Tenor" { \stanzac }
\new Lyrics \lyricsto "Tenor" { \stanzad }

>>
      >>
    \layout{}
    \midi{}
    }