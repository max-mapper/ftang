require 'rubygems'
require 'sinatra'
require 'pow'
require 'haml'

helpers do
  include Rack::Utils
  alias_method :escaped, :escape_html
end

@base_dir = "/public" 

get '/' do
  @artists = []
  path = Pow("/")
  path.directories.each do |artist| 
    @artists << artist.name
  end
  haml :index
end

get '/play/:artist' do
  @albums = {}
  path = Pow("#{@base_dir}#{params[:artist]}/")
  path.directories.each do |album|
    @art = "/music/#{params[:artist]}/#{album.name}/folder.jpeg"
    if album['folder.jpeg'].exists?
      @albums.merge!({"#{album.name}" => @art})
    else
      @albums.merge!({"#{album.name}" => "missing"})
    end
  end
  @albums = @albums.sort{|a,b| a[1]<=>b[1]}
  haml :artist
end

get '/play/:artist/:album' do
  @songs = {}
  path = Pow("#{@base_dir}#{params[:artist]}/#{params[:album]}/")
  path.files.each do |song|
    @songs.merge!({"#{song.name}" => "/music/#{params[:artist]}/#{params[:album]}/#{song.name}"})
  end
  @songs = @songs.sort{|a,b| a[1]<=>b[1]}
  @playlist = "["
  @songs.each do |title, url|
    @playlist += "{name:\"#{title}\",filename:\"#{url}\"},\n" unless title =~ /folder.jpeg|.DS_Store/
  end
  @playlist.chop!.chop!
  @playlist += "];"
  haml :album
end

# not_found do
#   haml :"404"
# end