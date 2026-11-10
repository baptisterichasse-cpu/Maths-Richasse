# Recopie moteur.js dans index.html (le moteur vit dans la page du site)
import sys
site = sys.argv[1]
moteur = open('moteur.js').read().replace("if (typeof module !== 'undefined') module.exports = Algebre;\n", '').rstrip('\n')
moteur = '\n'.join(('  ' + l if l.strip() else '') for l in moteur.split('\n'))
p = site + '/index.html'; s = open(p).read()
debut = s.index('  /* ---------- Moteur de correction des révisions ----------')
fin = s.index('  })();\n', debut) + len('  })();\n')
s = s[:debut] + moteur + '\n' + s[fin:]
open(p, 'w').write(s)
print('moteur recopié')
