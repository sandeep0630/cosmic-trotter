\ = @('akasha-deep.html','vishwaroopa-deep.html','vishwaroopa.html','panchakosha.html','upanishads.html','panchakosha-deep.html','nasadiya-sukta.html','nasadiya-sukta-deep.html','kala.html','hiranyagarbha-deep.html','hiranyagarbha.html','kala-deep.html','ask-krishna.html','akasha.html','ask-krishna-bot.html')
foreach (\ in \) {
  \ = 'ancient-wisdom/' + \
  if (Test-Path \) {
    \ = Get-Content \ -Raw -ErrorAction SilentlyContinue
    \ = \
    \ = \ -replace 'â—', '—'
    if (\ -ne \) {
      Set-Content \ -Value \ -NoNewline -Encoding UTF8
      Write-Output ('Fixed emdash in ' + \)
    }
  }
}
Write-Output 'Done emdash fixes.'
