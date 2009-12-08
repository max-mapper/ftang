# require '/home/maxo/.gems/gems/rack-0.9.1/lib/rack.rb'
# require '/home/maxo/.gems/gems/sinatra-0.9.2/lib/sinatra.rb'
# require '/home/maxo/.gems/gems/pow-0.2.2/lib/pow.rb'
# require '/home/maxo/.gems/gems/haml-2.0.9/lib/haml.rb'

require 'rack'
require 'sinatra'
require 'pow'
require 'haml'
require 'environment'
require 'ftang'
require 'cgi'
require 'sass/plugin/rack'
require 'json'
require 'logger'

use Sass::Plugin::Rack
Sass::Plugin.options[:css_location] = "./public" 
Sass::Plugin.options[:template_location] = "./views"

log = File.new("log/sinatra.log", "a+")
STDOUT.reopen(log)
STDERR.reopen(log)

run Sinatra::Application