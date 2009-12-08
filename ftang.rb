use Rack::Session::Cookie

MUSIC_DIR = "music"
def base_dir;"public/#{MUSIC_DIR}";end

helpers do
  def partial(page, options={})
    haml page, options.merge!(:layout => false)
  end
  
  def reset_session
    env['rack.session'] = {}
  end
  
  def capture(*args)
    args.each_with_index do |arg, i|
      instance_variable_set("@#{arg}".to_sym, params[:captures][i])
    end
  end
end

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
  set :sessions, true
end

def get_cover(artist, album)
  Pow("#{base_dir}/#{artist}/#{album}").files.each do |file|
    if file.extention =~ /jpe?g|png/i
      return "/#{MUSIC_DIR}/#{artist}/#{album}/#{file.name}"
    end
  end
  nil
end

get '/' do
  session[:playlist] ||= []
  haml :base
end

get '/artists' do
  @artists = []
  Pow(base_dir).directories.each do |artist| 
    @artists << artist.name
  end
  @artists.sort!
  partial :artists, :locals => {:artists => @artists}
end

get %r{/play/([^/]+)(/)?} do
  pass unless params[:captures][1].nil?
  capture :artist
  @albums = {}
  Pow("#{base_dir}/#{@artist}/").directories.each do |album|
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
  capture :artist, :album
  @cover = get_cover(@artist, @album)
  partial :songs, :locals => {:artist => @artist, :album => @album, :cover => @cover}
end

get %r{/playlist/add/([^/]+)/([^/]+)} do
  capture :artist, :album
  p "artist: #{@artist}, album: #{@album}"
  @songs = []
  Pow("#{base_dir}/#{@artist}/#{@album}/").files.each do |song|
    unless song.name =~ /.jpe?g|.png|.gif|.DS_Store/i
      @songs << {"name" => "#{CGI.unescape(song.name)}", "mp3" => "/#{MUSIC_DIR}/#{@artist}/#{@album}/#{song.name}"}
    end
  end
  @songs = @songs.sort{|a,b| a["name"]<=>b["name"]}
  @songs.each {|song| session[:playlist] << song}
  p "sweet beans"
end

get '/playlist/load' do
  content_type :json
  session[:playlist].to_json
end

get '/playlist/clear' do
  session[:playlist] = []
end

get '/session/clear' do
  reset_session
end

get '/allcovers' do
  @artists = []
  @covers = {}
  Pow(base_dir).directories.each do |artist|
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