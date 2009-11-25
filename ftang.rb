# require 'rubygems'
# require 'sinatra'
# require 'pow'
# require 'haml'

# helpers do
#   include Rack::Utils
#   alias_method :escaped, :escape_html
# end

def music_dir;"music";end
def basedir;"public/#{music_dir}";end

helpers do
  def partial(page, options={})
    haml page, options.merge!(:layout => false)
  end
end

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
end

def get_cover(artist, album)
  path = Pow("#{basedir}/#{artist}/#{album}")
  path.files.each do |file|
    if file.extention =~ /jpe?g|png/i
      return "/#{music_dir}/#{artist}/#{album}/#{file.name}"
    end
  end
  nil
end

get '/' do
  @artists = []
  path = Pow(basedir)
  path.directories.each do |artist| 
    @artists << artist.name
  end
  @artists.sort!
  @content = partial :artists, :locals => {:artists => @artists}
  haml :base
end

get %r{/play/([^/]+)(/)?} do
  pass unless params[:captures][1].nil?
  p "passing..."
  p "artist: #{params[:captures][0]}"
  p "album: #{params[:captures][1]}"
  @artist = params[:captures][0]
  @albums = {}
  path = Pow("#{basedir}/#{@artist}/")
  path.directories.each do |album|
    @cover = get_cover(@artist, album.name)
    if @cover
      @albums.merge!({"#{album.name}" => @cover})
    else
      @albums.merge!({"#{album.name}" => "missing"})
    end
  end
  @albums = @albums.sort{|a,b| a[1]<=>b[1]}
  partial :albums, :locals => {:artist => @artist, :albums => @albums, :cover => @cover}
end

get %r{/play/([^/]+)/([^/]+)?} do
  p "passed!"
  @artist = params[:captures][0]
  @album = params[:captures][1]
  p "artist: #{@artist}"
  p "album: #{@album}"
  @songs = {}
  path = Pow("#{basedir}/#{@artist}/#{@album}/")
  @cover = get_cover(@artist, @album)
  path.files.each do |song|
    @songs.merge!({"#{song.name}" => "/#{music_dir}/#{@artist}/#{@album}/#{song.name}"})
  end
  @songs = @songs.sort{|a,b| a[1]<=>b[1]}
  @playlist = "["
  @songs.each do |title, url|
    @playlist += "{name:\"#{CGI.unescape(title)}\",mp3:\"#{url}\"},\n" unless title =~ /.jpe?g|.png|.DS_Store/i
  end
  @playlist.chop!.chop!
  @playlist += "];"
  haml :album
end

get '/allcovers' do
  @artists = []
  @covers = {}
  path = Pow("#{basedir}")
  path.directories.each do |artist|
    albums = []
    artist.directories.each do |album|
      cover = get_cover(artist.name, album.name)
      if cover
        albums << album.name
        @covers.merge!({album.name => cover})
      end
    end
    @artists << {"name" => artist.name, "albums" => albums} unless albums.empty?
  end
  haml :all
end

not_found do
  haml :"404"
end