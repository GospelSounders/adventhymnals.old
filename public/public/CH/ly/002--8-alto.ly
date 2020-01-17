\header
    {
      tagline = ""  % removed
      title = "2. From All That Dwell Below the Skies "
      composer = " Orlando Gibbons "
      poet = " Isaac Watts (1674-1748) "
      subtitle = "L.M"
    }
    \version "2.18.2"
    %
    %% global for all staves
    %
global = { \key g \major \time 3/4 \tempo 4 = 100 \partial 4 }
%Individual voices

soprano = {g'4 b'2 g'4 a'2 b'4 c''4 (b'4) a'4 g'2 g'4 b'2 cis''4 d''2 a'4 d''2 cis''4 d''2 b'4 c''2 d''4 e''2 d''4 c''2 b'4 a'2 d''4 c''2 b'4 a'2 g'4 c''4 (b'4) a'4 g'2. }
alto = {d'4 d'2 e'4 fis'2 g'4 g'2 fis'4 g'2 d'4 g'2 g'4 fis'4 (g'4) a'4 g'4 (fis'4) e'4 fis'2 d'4 g'2 g'4 g'2 g'4 g'4 (fis'4) g'4 fis'2 g'4 fis'2 g'4 fis'2 g'4 a'4 (g'4) fis'4 g'2. }
tenor = {b4 g2 b4 d'2 d'4 e'4 (d'4) c'4 b2 b4 d'2 a4 a2 d'4 b4 (a4) a4 a2 g4 g4 (c'4) b4 c'2 d'4 e'4 (d'4) d'4 d'2 d'4 d'2 d'4 d'4 (c'4) b4 e'4 (d'4) c'4 b2. }
bass = {g4 g2 e4 d2 g4 c4 (d4) d4 g,2 g4 g2 e4 d4 (e4) fis4 g4 (a4) a,4 d2 g4 e2 d4 c2 b,4 a,2 g,4 d2 b4 a2 g4 d2 e4 c4 (d4) d4 g,2. }
%lyrics
stanzaa =  \lyricmode { \set stanza = #"1. "From all that dwell be- low the skies Let the Cre- a- tor's praise a- rise; Let His al- migh- ty name be sung Through e- very land, by e- very tongue. }
stanzab =  \lyricmode { \set stanza = #"2. "E- ter- nal are Thy mer- cies, Lord, E- ter- nal truth at- tends Thy word; Thy praise shall sound from shore to shore, Till suns shall rise and set no more. }
stanzac =  \lyricmode { \set stanza = #"3. "Your lo- fty themes, ye mor- tals, bring, In songs of praise di- vine- ly sing; God's great sal- va- tion loud pro- claim, And shout for joy His glo- rious name. }
stanzad =  \lyricmode { \set stanza = #"4. "In e- very land be- gin the song, To e- very land the strains be- long; In cheer- ful sounds all voi- ces raise, And fill the world with loud- est praise. }
\score {
      \new ChoirStaff <<
       \new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>
\new Staff <<
\clef "treble"
        \new Voice = "Alto" { \voiceTwo \global \alto}

        \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>

        \new Staff <<
      \clef "bass"
      

      \new Lyrics \lyricsto "Alto" { \stanzaa }
\new Lyrics \lyricsto "Alto" { \stanzab }
\new Lyrics \lyricsto "Alto" { \stanzac }
\new Lyrics \lyricsto "Alto" { \stanzad }

>>

      >>
    \layout{}
    \midi{}
    }