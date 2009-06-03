require 'rubygems'
require 'nokogiri'
require 'rio'
require 'pow'
require 'open-uri'
require 'cgi'

$stdout = File.new( '/home/maxo/DOESTHISMONKEYLOOKFUNNYTOYOU.COM/passenger/output.txt', 'w' )

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

# def retrieve(artist, album)
#   url = "http://www.discogs.com/search?type=releases&q=#{CGI.escape(artist)}+#{CGI.escape(album)}&btn=Search"
#   doc = Nokogiri::HTML(open(url)) rescue nil
#   if (doc =~ /Your search returned no results/).nil?
#     return nil
#   else
#     albums = doc.xpath("//li[@style='background:#fff']") rescue nil
#     albums.each do |album|
#       listitem = album.css('span')[0].content
#       if (listitem =~ /release/).nil?
#       else
#         @albumpageurl = listitem
#         break
#       end
#     end
#     if @albumpageurl.nil?
#       return nil
#     end
#     @albumpageurl.gsub(/(www.discogs.com)\/([_%A-Za-z0-9-]+)\/([_%A-Za-z0-9-]+)\/([_%A-Za-z0-9-]+)/) do
#       @imageurl = "http://www.discogs.com/viewimages?release=#{$4}"
#       @albumpageurl = nil
#     end
#     @imagepage = Nokogiri::HTML(open(@imageurl)) rescue nil
#     if (@imagepage.to_html =~ /There are no images/).nil?
#       covers = @imagepage.xpath("//div[@id='mc_container']/img")
#       covers.each do |cover|
#         puts cover["src"]
#         @imagepage = nil
#         return cover["src"]
#       end
#     else
#       @imagepage = nil
#       return nil
#     end
#   end
# end

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