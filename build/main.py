import webapp2
import pdb

class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
	html = open("index.html") # FIXME
        self.response.write(html.read())

application = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
