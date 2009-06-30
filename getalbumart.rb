require 'rubygems'
require 'nokogiri'
require 'rio'
require 'pow'
require 'open-uri'
require 'cgi'

# $stdout = File.new( '/home/maxo/DOESTHISMONKEYLOOKFUNNYTOYOU.COM/passenger/output.txt', 'w' )

def retrieve(artist, album)
  url = "http://www.amazon.com/exec/obidos/external-search/?index=music&field-artist=#{CGI.escape(artist)}&field-title=#{CGI.escape(album)}"
  doc = Nokogiri::HTML(open(url)) rescue nil
  unless doc.nil?
    covers = doc.xpath("//img[@alt='Product Details']") rescue nil
    covers.each do |cover|
      if (cover["src"] =~ /no-img/).nil?
        @coverurl = cover["src"]
        break
      end
    end
    if @coverurl.nil?
      return nil
    else
      @coverurl.gsub(/(http:\/\/ecx.images-amazon.com\/images\/)([_%A-Za-z0-9-]+)\/([_%A-Za-z0-9-]+).([_%A-Za-z0-9-]+).+/) do
        url = "http://ecx.images-amazon.com/images/#{$2}/#{$3}.jpg"
        puts url
        @coverurl = nil
        return url
      end
    end
  end
end

path = Pow("/home/maxo/DOESTHISMONKEYLOOKFUNNYTOYOU.COM/music")
path.directories.each do |artist| 
  artist.directories.each do |album|
    puts "Processing Artist: #{artist.name}, Album: #{album.name}..."
    jpegpath = "/home/maxo/DOESTHISMONKEYLOOKFUNNYTOYOU.COM/music/#{artist.name}/#{album.name}/folder.jpeg"
    unless Pow(jpegpath).exists?
      cover = retrieve(artist.name, album.name)
      rio(jpegpath) < rio(cover) unless cover.nil?
    end
  end
end