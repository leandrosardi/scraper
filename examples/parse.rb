require 'nokogiri'

=begin
# roll back ingested files as not ingested
source = "./sales-navigator-result-pages/page*.html" # the files to be imported
# ingest the bites
Dir.glob(source).each do |file|
    # get the name of the file from the full path
    name = file.split('/').last
    # rollingback the file
    print "Rollingback #{name}... "
    File.rename(file, file.gsub('page ', ''))
    puts 'done'
end
exit(0)
=end

doc = Nokogiri::HTML(open('./sales-navigator-result-pages/1.html'))

lis = doc.xpath('//li[contains(@class, "artdeco-list__item")]')

i = 0
lis.each { |li|
    i += 1
    doc2 = Nokogiri::HTML(li.inner_html)
    n1 = doc2.xpath('//div[contains(@class,"artdeco-entity-lockup__title")]/a/span').first
    n2 = doc2.xpath('//div[contains(@class,"artdeco-entity-lockup__subtitle")]/a').first
    print "#{i.to_s}"
    print " - #{n1.text.strip}" if !n1.nil?
    print " - #{n2.text.strip}" if !n2.nil?
    puts
}

