"""Normalize an AI Studio import file to landing_website conventions.
Dev tool for import rounds — see landing_website/PORTING.md. Not used by the build.
Usage: python3 normalize-import.py <src> <dst>
- www.silarai.com -> silarai.com (www does not resolve)
- /api/* knowledge URLs -> generated /ai/*.json files
- strip trailing slashes on site paths (keep '/' and the existing /ai-commerce-marketing-platform/)
"""
import re, sys
API_MAP = [
 ('/api/ai-commerce-marketing-platform/keywords', '/ai/site-architecture.json'),
 ('/api/ai-commerce-marketing-platform/seo', '/ai/site-architecture.json'),
 ('/api/ai-shopping-assistant/keywords', '/ai/site-architecture.json'),
 ('/api/knowledge-graph/d2c', '/ai/d2c-knowledge-graph.json'),
 ('/api/d2c-knowledge-graph', '/ai/d2c-knowledge-graph.json'),
 ('/api/site-architecture', '/ai/site-architecture.json'),
 ('/api/geo-knowledge', '/ai/geo-knowledge.json'),
 ('/api/rag/context', '/ai/rag-chunks.json'),
 ('/api/ai-discovery', '/ai/discovery.json'),
 ('/api/aeo/faq', '/ai/aeo-faq.json'),
]
KEEP = {'/ai-commerce-marketing-platform'}
PREFIX_CALL = re.compile(r'(startsWith|endsWith|replace|replaceAll|includes|indexOf|split)\(\s*$')
def norm(s):
    s = s.replace('https://www.silarai.com', 'https://silarai.com')
    for a, b in API_MAP:
        s = re.sub(re.escape(a) + r'(?![A-Za-z0-9/_-])', b, s)
    def abs_strip(m):
        return m.group(0) if m.group(2) in KEEP else m.group(1)
    s = re.sub(r'(https://silarai\.com(/[A-Za-z0-9_\-/]*?[A-Za-z0-9_\-]))/(?=[#\'"`?\s)\]]|$)', abs_strip, s)
    def rel_strip(m):
        # Keep prefix strings used for matching, e.g. startsWith('/sector/') or
        # replace('/use-cases/', '') — stripping their slash changes behaviour.
        before = m.string[max(0, m.start() - 20):m.start()]
        if m.group(2) in KEEP or PREFIX_CALL.search(before):
            return m.group(0)
        return m.group(1) + m.group(2) + m.group(3)
    s = re.sub(r'([\'"`])(/[A-Za-z0-9_\-][A-Za-z0-9_\-/]*?[A-Za-z0-9_\-])/([\'"`])', rel_strip, s)
    # Template literals built on a host variable, e.g. `${CANONICAL_HOST}/about/` or `${origin}/use-cases/${slug}/`.
    def tpl_strip(m):
        return m.group(0) if m.group(2) in KEEP else m.group(1)
    s = re.sub(r'(\$\{(?:CANONICAL_HOST|origin|BASE_URL|baseUrl)\}(/[^`\s#]*?[A-Za-z0-9_\-}]))/(?=[`#])', tpl_strip, s)
    return s
src, dst = sys.argv[1], sys.argv[2]
open(dst, 'w', encoding='utf-8', newline='').write(norm(open(src, encoding='utf-8').read()))
